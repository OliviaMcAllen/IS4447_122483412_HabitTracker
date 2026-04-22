// Based on Week 11 Drizzle ORM tutorial
// Database client setup for Expo SQLite
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

// Open the SQLite database
const sqlite = openDatabaseSync('habits.db');

// Create tables if they don't exist
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    categoryId INTEGER NOT NULL,
    createdAt TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habitId INTEGER NOT NULL,
    date TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    notes TEXT
  );
  
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT
  );
  
  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habitId INTEGER NOT NULL,
    period TEXT NOT NULL,
    targetValue INTEGER NOT NULL
  );
`);

// Export the database instance to use in other files
export const db = drizzle(sqlite);