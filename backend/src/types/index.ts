/**
 * TypeScript type definitions for the collaborative code editor
 */

// ============= User Types =============
export interface IUser {
    _id: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserPublic {
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

export interface AuthPayload {
    userId: string;
    email: string;
    username: string;
}

// ============= Room Types =============
export interface IRoom {
    _id: string;
    roomId: string;
    name: string;
    owner: string;
    language: string;
    code: string;
    participants: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface RoomCreateInput {
    name?: string;
    language?: string;
}

// ============= Snippet Types =============
export interface ISnippet {
    _id: string;
    roomId: string;
    userId: string;
    code: string;
    language: string;
    name: string;
    createdAt: Date;
}

// ============= Chat Types =============
export interface IMessage {
    _id: string;
    roomId: string;
    userId: string;
    username: string;
    content: string;
    timestamp: Date;
}

export interface ChatMessageInput {
    roomId: string;
    content: string;
}

// ============= Socket Types =============
export interface SocketUser {
    id: string;
    username: string;
    color: string;
    cursor?: CursorPosition;
}

export interface CursorPosition {
    lineNumber: number;
    column: number;
}

export interface RoomState {
    users: Map<string, SocketUser>;
    language: string;
}

// ============= API Response Types =============
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
