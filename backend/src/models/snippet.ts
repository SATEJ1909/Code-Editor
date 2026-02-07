/**
 * Snippet model for saving code snapshots
 * Allows users to save and load code versions
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ISnippetDocument extends Document {
  roomId: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  language: string;
  createdAt: Date;
}

const SnippetSchema = new Schema<ISnippetDocument>(
  {
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
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Untitled Snippet',
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'javascript',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for efficient room + user queries
SnippetSchema.index({ roomId: 1, userId: 1 });
SnippetSchema.index({ roomId: 1, createdAt: -1 });

const SnippetModel = mongoose.model<ISnippetDocument>('Snippet', SnippetSchema);
export default SnippetModel;