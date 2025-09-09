// server/db/run-init.ts
import { initializeDatabase } from './init.js'; // NOTE: .js extension required
// Top-level await works with tsx
await initializeDatabase();
