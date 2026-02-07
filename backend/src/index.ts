/**
 * Main server entry point
 * Sets up Express, Socket.IO, and MongoDB connection
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import mongoose from 'mongoose';

import { config } from './config';
import { setupSocket } from './socket';

// Import routes
import UserRouter from './routes/user';
import SnippetRouter from './routes/snippet';
import RoomRouter from './routes/room';
import ExecutorRouter from './routes/executor';

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = setupSocket(server);

// Make io accessible to routes if needed
app.set('io', io);

// ============= Middleware =============

// CORS configuration
app.use(
    cors({
        origin: config.corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (config.nodeEnv === 'development') {
    app.use((req, _res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// ============= Routes =============

// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api/v1/user', UserRouter);
app.use('/api/v1/snippet', SnippetRouter);
app.use('/api/v1/room', RoomRouter);
app.use('/api/v1/execute', ExecutorRouter);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

// Error handler
app.use(
    (
        err: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) => {
        console.error('Server error:', err);
        res.status(500).json({
            success: false,
            error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
        });
    }
);

// ============= Server Startup =============

async function main() {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(config.mongoUri);
        console.log('✅ MongoDB connected');

        // Start server
        server.listen(config.port, () => {
            console.log(`
🚀 Server running on port ${config.port}
📡 WebSocket ready
🔗 API: http://localhost:${config.port}/api/v1
🏥 Health: http://localhost:${config.port}/health
      `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await mongoose.connection.close();
    server.close();
    process.exit(0);
});

main();
