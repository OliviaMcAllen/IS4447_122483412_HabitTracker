// Database schema definitions
// Based on Week 11 Drizzle ORM tutorial
// This file defines the structure of all tables used in the app

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Users table - stores login and account information
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: text('createdAt').notNull(),
});

// Habits table - stores each habit created by the user
export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('categoryId').notNull(),
  createdAt: text('createdAt').notNull(),
});

// Habit logs - records when a habit is completed
export const habitLogs = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habitId').notNull(),
  date: text('date').notNull(),
  count: integer('count').notNull().default(1),
  notes: text('notes'),
});

// Categories table - used to group habits and apply colours in the UI
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  colour: text('colour').notNull(),
  icon: text('icon'),
});

// Targets table - stores goals for habits used in statistics
export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habitId').notNull(),
  period: text('period').notNull(),
  targetValue: integer('targetValue').notNull(),
});