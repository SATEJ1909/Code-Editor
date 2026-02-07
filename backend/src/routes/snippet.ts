/**
 * Snippet (code save/load) routes
 */

import { Router } from 'express';
import {
    saveSnippet,
    getLatestSnippet,
    getSnippetHistory,
    getSnippetById,
} from '../controller/snippet';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const SnippetRouter = Router();

// Save snippet - requires auth
SnippetRouter.post('/save', authMiddleware, saveSnippet);

// Get latest snippet for room - optional auth
SnippetRouter.get('/:roomId', optionalAuth, getLatestSnippet);

// Get snippet history for room
SnippetRouter.get('/:roomId/history', optionalAuth, getSnippetHistory);

// Get specific snippet by ID
SnippetRouter.get('/id/:snippetId', optionalAuth, getSnippetById);

export default SnippetRouter;
