import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { Database as DatabaseSchema } from './schema.js';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine the data directory
let dataDirectory;
if (process.env.DATA_DIRECTORY) {
  dataDirectory = process.env.DATA_DIRECTORY;
} else {
  // Default to a data directory in the project root
  dataDirectory = path.join(__dirname, '../../data');
}

const databasePath = path.join(dataDirectory, 'database.sqlite');

console.log('Data directory:', dataDirectory);
console.log('Database path:', databasePath);

// Ensure the data directory exists
import { mkdirSync } from 'fs';
try {
  mkdirSync(dataDirectory, { recursive: true });
  console.log('Data directory created or already exists');
} catch (error) {
  console.error('Error creating data directory:', error);
  throw error;
}

let sqliteDb;
try {
  sqliteDb = new Database(databasePath);
  console.log('SQLite database connection established');
  
  // Enable foreign keys
  sqliteDb.pragma('foreign_keys = ON');
  console.log('Foreign keys enabled');
} catch (error) {
  console.error('Error connecting to SQLite database:', error);
  throw error;
}

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error']
});

console.log('Kysely database instance created');

// Test the connection
try {
  const result = sqliteDb.exec('SELECT 1');
  console.log('Database connection test successful');
} catch (error) {
  console.error('Database connection test failed:', error);
  throw error;
}
