import { Router } from "express";
import { signin , signup  } from "../controller/user";

const UserRouter = Router();
//@ts-ignore
UserRouter.post("/signup" , signup);
//@ts-ignore
UserRouter.post("/signin" , signin);

export default UserRouter ;
