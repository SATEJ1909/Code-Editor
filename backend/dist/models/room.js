"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RoomSchema = new mongoose_1.default.Schema({
    roomId: { type: String, required: true, unique: true },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    isPrivate: { type: Boolean, default: false },
    members: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
});
const RoomModel = mongoose_1.default.model('Room', RoomSchema);
exports.default = RoomModel;
