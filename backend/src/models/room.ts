/**
 * Enhanced Room model for collaborative editing
 * Stores room metadata, participants, and current code state
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomDocument extends Document {
  roomId: string;
  name: string;
  owner: mongoose.Types.ObjectId;
  language: string;
  code: string;
  participants: mongoose.Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoomDocument>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Untitled Room',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    language: {
      type: String,
      default: 'javascript',
      enum: [
        'javascript',
        'typescript',
        'python',
        'java',
        'cpp',
        'c',
        'csharp',
        'go',
        'rust',
        'ruby',
        'php',
        'html',
        'css',
        'json',
        'markdown',
        'sql',
        'plaintext',
      ],
    },
    code: {
      type: String,
      default: '// Start coding here...\n',
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
RoomSchema.index({ owner: 1 });
RoomSchema.index({ participants: 1 });

const RoomModel = mongoose.model<IRoomDocument>('Room', RoomSchema);
export default RoomModel;