/**
 * Room controller
 * Handles room creation, retrieval, and management
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import RoomModel from '../models/room';

// Validation schemas
const createRoomSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    language: z.string().optional(),
    isPublic: z.boolean().optional(),
    password: z.string().min(4).max(50).optional(),
});

const joinRoomSchema = z.object({
    password: z.string().optional(),
});

/**
 * Create a new room
 * POST /api/v1/room
 */
export const createRoom = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const validation = createRoomSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors.map((e) => e.message).join(', '),
            });
            return;
        }

        const { name, language, isPublic, password } = validation.data;

        // Generate unique room ID
        const roomId = randomUUID().slice(0, 8);

        const room = new RoomModel({
            roomId,
            name: name || `Room ${roomId}`,
            owner: req.user.userId,
            language: language || 'javascript',
            isPublic: isPublic ?? true,
            participants: [req.user.userId],
            password: password || undefined,
            hasPassword: !!password,
        });

        await room.save();

        res.status(201).json({
            success: true,
            data: {
                roomId: room.roomId,
                name: room.name,
                language: room.language,
                isPublic: room.isPublic,
                hasPassword: room.hasPassword,
            },
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create room',
        });
    }
};

/**
 * Get room by ID
 * GET /api/v1/room/:roomId
 */
export const getRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;

        const room = await RoomModel.findOne({ roomId }).populate(
            'owner',
            'username email'
        );

        if (!room) {
            res.status(404).json({
                success: false,
                error: 'Room not found',
            });
            return;
        }

        res.json({
            success: true,
            data: {
                roomId: room.roomId,
                name: room.name,
                language: room.language,
                code: room.code,
                owner: room.owner,
                isPublic: room.isPublic,
                createdAt: room.createdAt,
            },
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get room',
        });
    }
};

/**
 * List rooms for current user (owned or participated)
 * GET /api/v1/room
 */
export const listRooms = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const rooms = await RoomModel.find({
            $or: [{ owner: req.user.userId }, { participants: req.user.userId }],
        })
            .sort({ updatedAt: -1 })
            .limit(50)
            .select('roomId name language isPublic createdAt updatedAt');

        res.json({
            success: true,
            data: rooms,
        });
    } catch (error) {
        console.error('List rooms error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list rooms',
        });
    }
};

/**
 * Join a room (add user to participants)
 * POST /api/v1/room/:roomId/join
 */
export const joinRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { roomId } = req.params;
        const validation = joinRoomSchema.safeParse(req.body);
        const { password } = validation.success ? validation.data : { password: undefined };

        // Find room with password field included
        const room = await RoomModel.findOne({ roomId }).select('+password');

        if (!room) {
            res.status(404).json({
                success: false,
                error: 'Room not found',
            });
            return;
        }

        // Check if room has password and verify it
        if (room.hasPassword && room.password) {
            if (!password) {
                res.status(403).json({
                    success: false,
                    error: 'Password required',
                    requiresPassword: true,
                });
                return;
            }

            const isValid = await room.comparePassword(password);
            if (!isValid) {
                res.status(403).json({
                    success: false,
                    error: 'Invalid password',
                });
                return;
            }
        }

        // Add user to participants if not already present
        if (!room.participants.includes(req.user.userId as any)) {
            room.participants.push(req.user.userId as any);
            await room.save();
        }

        res.json({
            success: true,
            data: {
                roomId: room.roomId,
                name: room.name,
                language: room.language,
            },
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join room',
        });
    }
};

/**
 * Update room settings (language, name)
 * PATCH /api/v1/room/:roomId
 */
export const updateRoom = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { roomId } = req.params;
        const { name, language } = req.body;

        const room = await RoomModel.findOneAndUpdate(
            { roomId },
            { $set: { ...(name && { name }), ...(language && { language }) } },
            { new: true }
        );

        if (!room) {
            res.status(404).json({
                success: false,
                error: 'Room not found',
            });
            return;
        }

        res.json({
            success: true,
            data: {
                roomId: room.roomId,
                name: room.name,
                language: room.language,
            },
        });
    } catch (error) {
        console.error('Update room error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update room',
        });
    }
};

/**
 * Delete a room (owner only)
 * DELETE /api/v1/room/:roomId
 */
export const deleteRoom = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const { roomId } = req.params;

        // Find the room first to check ownership
        const room = await RoomModel.findOne({ roomId });

        if (!room) {
            res.status(404).json({
                success: false,
                error: 'Room not found',
            });
            return;
        }

        // Check if user is the owner
        if (room.owner.toString() !== req.user.userId) {
            res.status(403).json({
                success: false,
                error: 'Only the room owner can delete this room',
            });
            return;
        }

        // Delete the room
        await RoomModel.deleteOne({ roomId });

        // Note: Associated snippets and messages could be deleted here too
        // For now, we'll leave them as orphaned data (they won't cause issues)

        res.json({
            success: true,
            message: 'Room deleted successfully',
        });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete room',
        });
    }
};
