import { Router } from "express";
import { createRoom , getRoomInfo } from "../controller/room";
import { userMiddleware } from "../middleware/user";
const RoomRouter = Router();
//@ts-ignore
RoomRouter.post("/create",userMiddleware , createRoom );
//@ts-ignore
RoomRouter.get("/:roomId" , getRoomInfo);

export default RoomRouter ;