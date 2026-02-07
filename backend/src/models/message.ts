/**
 * Chat message model for room-based chat
 * Stores persistent chat history for each room
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageDocument extends Document {
    roomId: string;
    userId: mongoose.Types.ObjectId;
    username: string;
    content: string;
    timestamp: Date;
}

const MessageSchema = new Schema<IMessageDocument>({
    roomId: {
        type: String,
        required: true,
        index: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

// Compound index for fetching room messages in order
MessageSchema.index({ roomId: 1, timestamp: -1 });

const MessageModel = mongoose.model<IMessageDocument>('Message', MessageSchema);
export default MessageModel;
