/**
 * User authentication routes
 */

import { Router } from 'express';
import { register, login, getMe } from '../controller/user';
import { authMiddleware } from '../middleware/auth';

const UserRouter = Router();

// Public routes
UserRouter.post('/register', register);
UserRouter.post('/login', login);

// Protected routes
UserRouter.get('/me', authMiddleware, getMe);

export default UserRouter;
