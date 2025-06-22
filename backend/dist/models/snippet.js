"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SnippetSchema = new mongoose_1.default.Schema({
    code: { type: String, required: true },
    language: { type: String, default: 'javascript' },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
});
const SnippetModel = mongoose_1.default.model('Snippet', SnippetSchema);
exports.default = SnippetModel;
