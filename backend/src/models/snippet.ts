import mongoose from "mongoose";

const SnippetSchema = new mongoose.Schema({
    code: { type: String, required: true },
    language: { type: String, default: 'javascript' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})

const SnippetModel = mongoose.model('Snippet' , SnippetSchema);
export default SnippetModel ;