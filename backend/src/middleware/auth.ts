/**
 * Authentication middleware for protecting routes
 * Verifies JWT tokens and attaches user info to request
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthPayload } from '../types';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

/**
 * Middleware to verify JWT token from Authorization header
 * Attaches decoded user payload to req.user if valid
 */
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'No token provided. Authorization header must be: Bearer <token>',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: 'Token expired. Please login again.',
            });
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: 'Invalid token.',
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Authentication failed.',
        });
    }
};

/**
 * Optional auth middleware - doesn't fail if no token provided
 * Used for routes that work with or without authentication
 */
export const optionalAuth = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
            req.user = decoded;
        }
        next();
    } catch {
        // Token invalid, but continue without user
        next();
    }
};

/**
 * Generate JWT token for authenticated user
 */
export const generateToken = (payload: AuthPayload): string => {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn as string,
    } as jwt.SignOptions);
};

/**
 * Verify JWT token and return payload
 */
export const verifyToken = (token: string): AuthPayload | null => {
    try {
        return jwt.verify(token, config.jwtSecret) as AuthPayload;
    } catch {
        return null;
    }
};
