import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
})

const ChatModel =  mongoose.model('Chats' , ChatSchema);

export default ChatModel ;