import { Request , Response } from "express";
import RoomModel from "../models/room";

export const  createRoom =  async(req : Request , res : Response) =>{
   try {
        const {roomId , isPrivate}  = req.body;
        const room = await RoomModel.create({roomId , isPrivate});
        res.status(200).json({ message : "Room Created Successfully" , room});
   } catch (error) {
    console.log(error);
    res.status(404).json({error})
   }
}


export const  getRoomInfo =  async(req: Request , res: Response) =>{
    try {
        const {roomId} = req.params;
        const room = await RoomModel.findOne({roomId});
        res.status(200).json({ room });
    } catch (error) {
        console.log(error);
        res.status(404).json({error})
    }
}