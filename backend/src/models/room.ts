import mongoose from "mongoose";

const RoomSchema= new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  language: { type: String, default: 'javascript' },
  createdAt: { type: Date, default: Date.now }
})

const RoomModel = mongoose.model('Room' , RoomSchema);
export default RoomModel ;