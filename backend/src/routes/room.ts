/**
 * Room management routes
 */

import { Router } from 'express';
import {
    createRoom,
    getRoom,
    listRooms,
    joinRoom,
    updateRoom,
    deleteRoom,
} from '../controller/room';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const RoomRouter = Router();

// Create room - requires auth
RoomRouter.post('/', authMiddleware, createRoom);

// List user's rooms - requires auth
RoomRouter.get('/', authMiddleware, listRooms);

// Get room - optional auth (public rooms accessible by all)
RoomRouter.get('/:roomId', optionalAuth, getRoom);

// Join room - requires auth
RoomRouter.post('/:roomId/join', authMiddleware, joinRoom);

// Update room - requires auth
RoomRouter.patch('/:roomId', authMiddleware, updateRoom);

// Delete room - requires auth (owner only)
RoomRouter.delete('/:roomId', authMiddleware, deleteRoom);

export default RoomRouter;
