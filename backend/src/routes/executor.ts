/**
 * Code execution routes
 */

import { Router } from 'express';
import { executeCode, getSupportedLanguages } from '../controller/executor';

const ExecutorRouter = Router();

// Execute code - no auth required (allows guests to run code)
ExecutorRouter.post('/', executeCode);

// Get supported languages
ExecutorRouter.get('/languages', getSupportedLanguages);

export default ExecutorRouter;
