/**
 * Snippet controller
 * Handles saving and loading code snapshots
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import SnippetModel from '../models/snippet';
import RoomModel from '../models/room';

// Validation schemas
const saveSnippetSchema = z.object({
    roomId: z.string().min(1),
    name: z.string().min(1).max(100).optional(),
    code: z.string(),
    language: z.string().optional(),
});

/**
 * Save a code snippet
 * POST /api/v1/snippet/save
 */
export const saveSnippet = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const validation = saveSnippetSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors.map((e) => e.message).join(', '),
            });
            return;
        }

        const { roomId, name, code, language } = validation.data;

        const snippet = new SnippetModel({
            roomId,
            userId: req.user.userId,
            name: name || `Snapshot ${new Date().toLocaleString()}`,
            code,
            language: language || 'javascript',
        });

        await snippet.save();

        // Also update room's current code
        await RoomModel.findOneAndUpdate({ roomId }, { $set: { code } });

        res.status(201).json({
            success: true,
            data: {
                id: snippet._id,
                name: snippet.name,
                createdAt: snippet.createdAt,
            },
        });
    } catch (error) {
        console.error('Save snippet error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save snippet',
        });
    }
};

/**
 * Get latest snippet for a room
 * GET /api/v1/snippet/:roomId
 */
export const getLatestSnippet = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { roomId } = req.params;

        // First try to get from room's current code
        const room = await RoomModel.findOne({ roomId });

        if (room && room.code) {
            res.json({
                success: true,
                data: {
                    code: room.code,
                    language: room.language,
                    source: 'room',
                },
            });
            return;
        }

        // Fallback to latest snippet
        const snippet = await SnippetModel.findOne({ roomId })
            .sort({ createdAt: -1 })
            .limit(1);

        if (!snippet) {
            res.json({
                success: true,
                data: {
                    code: '// Start coding here...\n',
                    language: 'javascript',
                    source: 'default',
                },
            });
            return;
        }

        res.json({
            success: true,
            data: {
                code: snippet.code,
                language: snippet.language,
                name: snippet.name,
                createdAt: snippet.createdAt,
                source: 'snippet',
            },
        });
    } catch (error) {
        console.error('Get snippet error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get snippet',
        });
    }
};

/**
 * Get snippet history for a room
 * GET /api/v1/snippet/:roomId/history
 */
export const getSnippetHistory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { roomId } = req.params;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

        const snippets = await SnippetModel.find({ roomId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('name language createdAt');

        res.json({
            success: true,
            data: snippets,
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get snippet history',
        });
    }
};

/**
 * Get a specific snippet by ID
 * GET /api/v1/snippet/id/:snippetId
 */
export const getSnippetById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { snippetId } = req.params;

        const snippet = await SnippetModel.findById(snippetId);

        if (!snippet) {
            res.status(404).json({
                success: false,
                error: 'Snippet not found',
            });
            return;
        }

        res.json({
            success: true,
            data: {
                id: snippet._id,
                code: snippet.code,
                language: snippet.language,
                name: snippet.name,
                createdAt: snippet.createdAt,
            },
        });
    } catch (error) {
        console.error('Get snippet by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get snippet',
        });
    }
};
