import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { recipesRouter } from './routes/recipes.js';
import { mealsRouter } from './routes/meals.js';
import { initializeDatabase } from './db/init.js';
dotenv.config();
const app = express();
// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// API routes
app.use('/api/recipes', recipesRouter);
app.use('/api/meals', mealsRouter);
// Export a function to start the server
export async function startServer(port) {
    try {
        console.log('Initializing database...');
        await initializeDatabase();
        console.log('Database initialized successfully');
        if (process.env.NODE_ENV === 'production') {
            console.log('Setting up static file serving for production...');
            setupStaticServing(app);
        }
        const server = app.listen(port, () => {
            console.log(`API Server running on port ${port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Data directory: ${process.env.DATA_DIRECTORY || './data'}`);
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            console.log('SIGINT received, shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });
        return server;
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Starting server...');
    const port = process.env.PORT || 3001;
    console.log(`Port: ${port}`);
    startServer(port);
}
