import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config';
import { Request, Response  , NextFunction} from 'express'

export const userMiddleware = (req : Request , res : Response , next : NextFunction) =>{
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    const token = authHeader.split(" ")[1]; 

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

