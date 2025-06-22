"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ChatSchema = new mongoose_1.default.Schema({
    roomId: { type: String, required: true },
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
});
const ChatModel = mongoose_1.default.model('Chats', ChatSchema);
exports.default = ChatModel;
