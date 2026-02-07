/**
 * Enhanced Room model for collaborative editing
 * Stores room metadata, participants, and current code state
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IRoomDocument extends Document {
  roomId: string;
  name: string;
  owner: mongoose.Types.ObjectId;
  language: string;
  code: string;
  participants: mongoose.Types.ObjectId[];
  isPublic: boolean;
  password?: string;
  hasPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
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
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
RoomSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.hasPassword = true;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
RoomSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return true; // No password set
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for faster lookups
RoomSchema.index({ owner: 1 });
RoomSchema.index({ participants: 1 });

const RoomModel = mongoose.model<IRoomDocument>('Room', RoomSchema);
export default RoomModel;