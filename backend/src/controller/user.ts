import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import UserModel from "../models/user";
import z from "zod";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config";

const requiredSchema = z.object({
    username: z.string().min(4).max(30),
    email: z.string().email(),
    password: z.string().min(4).max(30)
})


export const signup = async (req: Request, res: Response) => {
    if (!requiredSchema.safeParse(req.body).success) {
        return res.status(404).json({
            message: "Invalid Inputs"
        })
    }
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(404).json({
                message: "All Fields are necessary"
            })
        }

        const existingUser = await UserModel.findOne({email});

        if(existingUser){
            return res.status(404).json({
                message : "Email already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password , 10);

        const user = await UserModel.create({username , email , password : hashedPassword});

        res.status(200).json({
            message : "User Created SuccessFully",
            user : user
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const signin = async(req : Request , res : Response) => {
    try {
        const {email , password} = req.body;
        const user = await UserModel.findOne({email});
        if(!user){
            res.status(404).json({
                message : "Invalid email or password"
            })
        }      
       //@ts-ignore 
       const isPasswordValid = await bcrypt.compare(password , user?.password);

       if(!isPasswordValid){
         return res.status(400).json({ error: "Invalid  password" });
       }
       if(user){
         const token = jwt.sign({id : user._id} , JWT_SECRET);

         res.status(201).json({
            token
         })

       }else {
            return res.status(400).json({ error: "Invalid email or password" });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}