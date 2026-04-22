// Based on Week 11 Drizzle ORM tutorial
// Defines the database tables for Habit Tracker
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Habits table - stores the habit definitions
export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('categoryId').notNull(),
  createdAt: text('createdAt').notNull(),
});

// Habit logs - records when a habit was completed
export const habitLogs = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habitId').notNull(),
  date: text('date').notNull(),
  count: integer('count').notNull().default(1),
  notes: text('notes'),
});

// Categories - organize habits
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon'),
});

// Targets - weekly/monthly goals
export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habitId').notNull(),
  period: text('period').notNull(), // 'weekly' or 'monthly'
  targetValue: integer('targetValue').notNull(),
});