import mongoose from "mongoose";

const RoomSchema= new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPrivate: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
})

const RoomModel = mongoose.model('Room' , RoomSchema);
export default RoomModel ;