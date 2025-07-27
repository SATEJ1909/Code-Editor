import mongoose from "mongoose";

const SnippetSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  createdAt: { type: Date, default: Date.now }
})

const SnippetModel = mongoose.model('Snippet' , SnippetSchema);
export default SnippetModel ;