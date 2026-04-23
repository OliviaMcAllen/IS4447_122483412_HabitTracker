// Based on Week 11 Drizzle ORM tutorial
// Database client setup for Expo SQLite
// Week 11 tutorial: Setting up database connection and initialising tables
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

// Open the SQLite database
// Pattern from Week 11 tutorial - openDatabaseSync creates or opens existing database
const sqlite = openDatabaseSync('habits_final.db');

// Create tables if they don't exist
// Uses SQL CREATE TABLE IF NOT EXISTS pattern to safely initialise database schema
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    colour TEXT NOT NULL,
    icon TEXT
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    categoryId INTEGER NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habitId INTEGER NOT NULL,
    date TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    notes TEXT
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habitId INTEGER NOT NULL,
    period TEXT NOT NULL,
    targetValue INTEGER NOT NULL
  );
`);

// Export the database instance to use in other files
// Pattern from Week 11 tutorial - drizzle wraps SQLite for ORM functionality
export const db = drizzle(sqlite);