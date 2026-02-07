/**
 * Socket.IO server configuration
 * Handles real-time collaboration events:
 * - Room management (join/leave)
 * - Code synchronization via Yjs CRDT
 * - Cursor presence broadcasting
 * - Chat messaging
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from './config';
import { verifyToken } from './middleware/auth';
import MessageModel from './models/message';
import RoomModel from './models/room';

// Store active users per room
interface RoomUser {
  id: string;
  socketId: string;
  username: string;
  color: string;
  cursor?: { lineNumber: number; column: number };
}

const roomUsers = new Map<string, Map<string, RoomUser>>();

// Generate consistent user color from username
function getUserColor(username: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const setupSocket = (server: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ============= Connection Handler =============
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    let currentRoom: string | null = null;
    let currentUser: RoomUser | null = null;

    // ============= Authentication =============
    socket.on('authenticate', async (token: string, callback) => {
      try {
        const payload = verifyToken(token);
        if (!payload) {
          callback?.({ success: false, error: 'Invalid token' });
          return;
        }

        currentUser = {
          id: payload.userId,
          socketId: socket.id,
          username: payload.username,
          color: getUserColor(payload.username),
        };

        socket.data.user = currentUser;
        callback?.({ success: true, user: currentUser });
        console.log(`🔐 Authenticated: ${payload.username}`);
      } catch (error) {
        callback?.({ success: false, error: 'Authentication failed' });
      }
    });

    // ============= Room Management =============
    socket.on('join-room', async (roomId: string, username?: string) => {
      try {
        // Leave previous room if any
        if (currentRoom) {
          socket.leave(currentRoom);
          const users = roomUsers.get(currentRoom);
          if (users && currentUser) {
            users.delete(currentUser.id);
            socket.to(currentRoom).emit('user-left', {
              id: currentUser.id,
              username: currentUser.username,
            });
          }
        }

        // Use provided username or socket data
        const displayName = username || currentUser?.username || `Guest-${socket.id.slice(0, 4)}`;

        if (!currentUser) {
          currentUser = {
            id: socket.id,
            socketId: socket.id,
            username: displayName,
            color: getUserColor(displayName),
          };
        }

        currentRoom = roomId;
        socket.join(roomId);

        // Initialize room users map
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Map());
        }
        roomUsers.get(roomId)!.set(currentUser.id, currentUser);

        // Notify others in room
        socket.to(roomId).emit('user-joined', {
          id: currentUser.id,
          username: currentUser.username,
          color: currentUser.color,
        });

        // Send current room users to new joiner
        const users = Array.from(roomUsers.get(roomId)!.values());
        socket.emit('room-users', users);

        // Load room data
        const room = await RoomModel.findOne({ roomId });
        if (room) {
          socket.emit('room-data', {
            code: room.code,
            language: room.language,
          });
        }

        console.log(`📦 ${currentUser.username} joined room: ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('leave-room', () => {
      if (currentRoom && currentUser) {
        const users = roomUsers.get(currentRoom);
        if (users) {
          users.delete(currentUser.id);
          socket.to(currentRoom).emit('user-left', {
            id: currentUser.id,
            username: currentUser.username,
          });
        }
        socket.leave(currentRoom);
        currentRoom = null;
      }
    });

    // ============= Code Synchronization =============
    socket.on('code-change', async ({ roomId, code, language }) => {
      // Broadcast to other users in room
      socket.to(roomId).emit('code-update', { code, language });

      // Debounced save to database (every 5 seconds max)
      // In production, use Redis for proper debouncing
      try {
        await RoomModel.findOneAndUpdate(
          { roomId },
          { $set: { code, ...(language && { language }) } }
        );
      } catch (error) {
        console.error('Code save error:', error);
      }
    });

    socket.on('language-change', ({ roomId, language }) => {
      socket.to(roomId).emit('language-update', language);
    });

    // ============= Cursor Presence =============
    socket.on('cursor-move', ({ roomId, cursor }) => {
      if (currentUser) {
        currentUser.cursor = cursor;
        socket.to(roomId).emit('cursor-update', {
          id: currentUser.id,
          username: currentUser.username,
          color: currentUser.color,
          cursor,
        });
      }
    });

    socket.on('cursor-select', ({ roomId, selection }) => {
      if (currentUser) {
        socket.to(roomId).emit('selection-update', {
          id: currentUser.id,
          username: currentUser.username,
          color: currentUser.color,
          selection,
        });
      }
    });

    // ============= Typing Indicators =============
    socket.on('typing-start', ({ roomId }) => {
      if (currentUser) {
        socket.to(roomId).emit('user-typing', {
          id: currentUser.id,
          username: currentUser.username,
        });
      }
    });

    socket.on('typing-stop', ({ roomId }) => {
      if (currentUser) {
        socket.to(roomId).emit('user-stopped-typing', {
          id: currentUser.id,
        });
      }
    });

    // ============= Chat Messages =============
    socket.on('chat-message', async ({ roomId, content }) => {
      if (!currentUser || !content.trim()) return;

      const messageData = {
        id: `${Date.now()}-${socket.id}`,
        userId: currentUser.id,
        username: currentUser.username,
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      // Broadcast to room
      io.to(roomId).emit('chat-receive', messageData);

      // Save to database
      try {
        await MessageModel.create({
          roomId,
          userId: currentUser.id,
          username: currentUser.username,
          content: content.trim(),
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Message save error:', error);
      }
    });

    socket.on('chat-history', async (roomId: string, callback) => {
      try {
        const messages = await MessageModel.find({ roomId })
          .sort({ timestamp: -1 })
          .limit(50)
          .lean();

        callback?.({
          success: true,
          messages: messages.reverse().map((m) => ({
            id: m._id.toString(),
            userId: m.userId.toString(),
            username: m.username,
            content: m.content,
            timestamp: m.timestamp.toISOString(),
          })),
        });
      } catch (error) {
        callback?.({ success: false, messages: [] });
      }
    });

    // ============= Disconnect Handler =============
    socket.on('disconnect', () => {
      if (currentRoom && currentUser) {
        const users = roomUsers.get(currentRoom);
        if (users) {
          users.delete(currentUser.id);
          io.to(currentRoom).emit('user-left', {
            id: currentUser.id,
            username: currentUser.username,
          });
        }
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
