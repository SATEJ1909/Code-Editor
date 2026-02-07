/**
 * User authentication controller
 * Handles registration, login, and user info retrieval
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import UserModel, { IUserDocument } from '../models/user';
import { generateToken } from '../middleware/auth';

// Validation schemas
const registerSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

/**
 * Register a new user
 * POST /api/v1/user/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors.map((e) => e.message).join(', '),
            });
            return;
        }

        const { username, email, password } = validation.data;

        // Check if user already exists
        const existingUser = await UserModel.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            res.status(409).json({
                success: false,
                error:
                    existingUser.email === email
                        ? 'Email already registered'
                        : 'Username already taken',
            });
            return;
        }

        // Create new user
        const user: IUserDocument = new UserModel({ username, email, password });
        await user.save();

        // Generate JWT token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.',
        });
    }
};

/**
 * Login user and return JWT
 * POST /api/v1/user/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors.map((e) => e.message).join(', '),
            });
            return;
        }

        const { email, password } = validation.data;

        // Find user with password field included
        const user = await UserModel.findOne({ email }).select('+password');

        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }

        // Generate JWT token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.',
        });
    }
};

/**
 * Get current authenticated user info
 * GET /api/v1/user/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const user = await UserModel.findById(req.user.userId);

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.json({
            success: true,
            data: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user info',
        });
    }
};
