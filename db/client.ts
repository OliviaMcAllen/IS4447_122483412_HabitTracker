// Database client setup
// Based on Week 11 Drizzle ORM tutorial for SQLite integration
// Handles database connection and table creation for the app

import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

// Open or create the SQLite database
// Week 11: openDatabaseSync ensures the database is available before queries run
const sqlite = openDatabaseSync('habits_final.db');

// Create users table
// Week 11: CREATE TABLE IF NOT EXISTS prevents errors if table already exists
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

// Create categories table for organising habits
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    colour TEXT NOT NULL,
    icon TEXT
  );
`);

// Create habits table which stores main habit data
// categoryId links each habit to a category
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    categoryId INTEGER NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

// Create habit_logs table to track daily completion
// Each entry records a habit, date, and completion count
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habitId INTEGER NOT NULL,
    date TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    notes TEXT
  );
`);

// Create targets table for storing user goals
// period defines whether the target is daily, weekly, etc.
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habitId INTEGER NOT NULL,
    period TEXT NOT NULL,
    targetValue INTEGER NOT NULL
  );
`);

// Export database instance
// Week 11: drizzle wraps the SQLite database to allow ORM-style queries
export const db = drizzle(sqlite);