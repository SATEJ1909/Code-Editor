import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export const setupSocket = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:3000", // your frontend domain
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`✅ New connection: ${socket.id}`);

    // Join Room
    socket.on('join-room', (roomId: string, username: string) => {
      socket.join(roomId);
      console.log(`${username} joined room ${roomId}`);
      socket.to(roomId).emit('user-joined', username);
    });

    socket.on('code-change', ({ roomId, code }) => {
      socket.to(roomId).emit('code-update', code);
    });

    socket.on('chat-message', ({ roomId, message, username }) => {
      io.to(roomId).emit('chat-receive', {
        message,
        username,
        timestamp: Date.now()
      });
    });


    socket.on('disconnect', () => {
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });

  return io;
};
