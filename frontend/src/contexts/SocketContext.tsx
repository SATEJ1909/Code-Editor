/**
 * Socket Context
 * Manages Socket.IO connection and provides socket instance
 */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface RoomUser {
    id: string;
    username: string;
    color: string;
    cursor?: { lineNumber: number; column: number };
}

interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    content: string;
    timestamp: string;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    roomUsers: RoomUser[];
    currentRoom: string | null;
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
    sendCodeChange: (code: string, language?: string) => void;
    sendCursorMove: (cursor: { lineNumber: number; column: number }) => void;
    sendChatMessage: (content: string) => void;
    chatMessages: ChatMessage[];
    typingUsers: Map<string, string>;
    sendTypingStart: () => void;
    sendTypingStop: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface SocketProviderProps {
    children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('🔌 Socket connected');
            setIsConnected(true);

            // Authenticate if we have a token
            if (token) {
                newSocket.emit('authenticate', token, (response: any) => {
                    if (response.success) {
                        console.log('🔐 Socket authenticated');
                    }
                });
            }
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
        });

        // Room events
        newSocket.on('room-users', (users: RoomUser[]) => {
            setRoomUsers(users);
        });

        newSocket.on('user-joined', (user: RoomUser) => {
            setRoomUsers((prev) => {
                if (prev.find((u) => u.id === user.id)) return prev;
                return [...prev, user];
            });
        });

        newSocket.on('user-left', (user: { id: string }) => {
            setRoomUsers((prev) => prev.filter((u) => u.id !== user.id));
        });

        // Chat events
        newSocket.on('chat-receive', (message: ChatMessage) => {
            setChatMessages((prev) => [...prev, message]);
        });

        // Typing events
        newSocket.on('user-typing', (data: { id: string; username: string }) => {
            setTypingUsers((prev) => {
                const next = new Map(prev);
                next.set(data.id, data.username);
                return next;
            });
        });

        newSocket.on('user-stopped-typing', (data: { id: string }) => {
            setTypingUsers((prev) => {
                const next = new Map(prev);
                next.delete(data.id);
                return next;
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    const joinRoom = useCallback((roomId: string) => {
        if (socket && isConnected) {
            setChatMessages([]);
            socket.emit('join-room', roomId, user?.username);
            setCurrentRoom(roomId);

            // Load chat history
            socket.emit('chat-history', roomId, (response: any) => {
                if (response.success) {
                    setChatMessages(response.messages);
                }
            });
        }
    }, [socket, isConnected, user?.username]);

    const leaveRoom = useCallback(() => {
        if (socket && currentRoom) {
            socket.emit('leave-room');
            setCurrentRoom(null);
            setRoomUsers([]);
            setChatMessages([]);
        }
    }, [socket, currentRoom]);

    const sendCodeChange = useCallback((code: string, language?: string) => {
        if (socket && currentRoom) {
            socket.emit('code-change', { roomId: currentRoom, code, language });
        }
    }, [socket, currentRoom]);

    const sendCursorMove = useCallback((cursor: { lineNumber: number; column: number }) => {
        if (socket && currentRoom) {
            socket.emit('cursor-move', { roomId: currentRoom, cursor });
        }
    }, [socket, currentRoom]);

    const sendChatMessage = useCallback((content: string) => {
        if (socket && currentRoom && content.trim()) {
            socket.emit('chat-message', { roomId: currentRoom, content });
        }
    }, [socket, currentRoom]);

    const sendTypingStart = useCallback(() => {
        if (socket && currentRoom) {
            socket.emit('typing-start', { roomId: currentRoom });
        }
    }, [socket, currentRoom]);

    const sendTypingStop = useCallback(() => {
        if (socket && currentRoom) {
            socket.emit('typing-stop', { roomId: currentRoom });
        }
    }, [socket, currentRoom]);

    return (
        <SocketContext.Provider
            value={{
                socket,
                isConnected,
                roomUsers,
                currentRoom,
                joinRoom,
                leaveRoom,
                sendCodeChange,
                sendCursorMove,
                sendChatMessage,
                chatMessages,
                typingUsers,
                sendTypingStart,
                sendTypingStop,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
