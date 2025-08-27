import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Sets up static file serving for the Express app
 * @param app Express application instance
 */
export function setupStaticServing(app) {
    // Determine the public directory path
    let publicPath;
    if (process.env.NODE_ENV === 'production') {
        // Production: serve from dist/public
        publicPath = path.join(process.cwd(), 'dist', 'public');
        console.log('Production mode - serving static files from:', publicPath);
    }
    else {
        // Development: serve from client/public
        publicPath = path.join(__dirname, '../../client/public');
        console.log('Development mode - serving static files from:', publicPath);
    }
    // Serve static files
    app.use(express.static(publicPath, {
        maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
        index: false // SPA routing will handle index.html
    }));
    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    });
    // SPA routing: serve index.html for all non-API routes
    app.get('/*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
            return next();
        }
        const indexPath = path.join(publicPath, 'index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error('Error serving index.html:', err);
                res.status(500).send('Internal Server Error');
            }
            else {
                console.log('Served SPA route:', req.path);
            }
        });
    });
}
// import path from 'path';
// import express from 'express';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// // Get the directory name for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// /**
//  * Sets up static file serving for the Express app
//  * @param app Express application instance
//  */
// export function setupStaticServing(app: express.Application) {
//   // Determine the public directory path
//   let publicPath;
//   if (process.env.NODE_ENV === 'production') {
//     // In production, static files are in dist/public
//     publicPath = path.join(process.cwd(), 'dist', 'public');
//     console.log('Production mode - serving from:', publicPath);
//   } else {
//     // In development, this shouldn't be called, but just in case
//     publicPath = path.join(__dirname, '../../client/public');
//     console.log('Development mode - serving from:', publicPath);
//   }
//   // Serve static files from the public directory
//   app.use(express.static(publicPath, {
//     maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
//     index: false // Don't serve index.html automatically
//   }));
//   // Health check endpoint
//   app.get('/api/health', (req, res) => {
//     res.json({ 
//       status: 'ok', 
//       timestamp: new Date().toISOString(),
//       environment: process.env.NODE_ENV || 'development'
//     });
//     return;
//   });
//   // For any other routes that don't start with /api/, serve the index.html file (SPA routing)
//   app.get('/*', (req, res, next) => {
//     // Skip API routes
//     if (req.path.startsWith('/api/')) {
//       return next();
//     }
//     console.log('Serving SPA route:', req.path);
//     const indexPath = path.join(publicPath, 'index.html');
//     res.sendFile(indexPath, (err) => {
//       if (err) {
//         console.error('Error serving index.html:', err);
//         res.status(500).send('Internal Server Error');
//       }
//     });
//     return;
//   });
// }
