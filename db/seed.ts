// Based on Week 11 Drizzle ORM tutorial
// Seed script - populates database with sample data for testing
import { db } from './client';
import { categories, habitLogs, habits, targets, users } from './schema';

export async function seedDatabaseIfEmpty() {
  // Check if data already exists
  const existingHabits = await db.select().from(habits);
  if (existingHabits.length > 0) return;

  // Insert sample users for authentication
  await db.insert(users).values([
    { 
      email: 'demo@example.com', 
      password: 'password123', 
      name: 'Demo User',
      createdAt: new Date().toISOString()
    },
  ]);

  // Insert sample categories
  await db.insert(categories).values([
    { name: 'Fitness', colour: '#EF4444', icon: 'F' },
    { name: 'Learning', colour: '#3B82F6', icon: 'L' },
    { name: 'Health', colour: '#10B981', icon: 'H' },
    { name: 'Productivity', colour: '#F59E0B', icon: 'P' },
  ]);

  // Insert sample habits
  await db.insert(habits).values([
    { name: 'Morning Run', description: '30 min run', categoryId: 1, createdAt: '2024-01-01' },
    { name: 'Read Book', description: 'Read for 1 hour', categoryId: 2, createdAt: '2024-01-01' },
    { name: 'Drink Water', description: '8 glasses daily', categoryId: 3, createdAt: '2024-01-02' },
    { name: 'Meditate', description: '10 min meditation', categoryId: 3, createdAt: '2024-01-02' },
  ]);

  // Insert sample habit logs
  await db.insert(habitLogs).values([
    { habitId: 1, date: '2024-01-15', count: 1, notes: 'Good pace' },
    { habitId: 1, date: '2024-01-16', count: 1, notes: 'Rainy day' },
    { habitId: 2, date: '2024-01-15', count: 1, notes: 'Finished chapter 5' },
    { habitId: 3, date: '2024-01-15', count: 8, notes: '' },
    { habitId: 4, date: '2024-01-15', count: 1, notes: 'Felt calm' },
  ]);

  // Insert sample targets
  await db.insert(targets).values([
    { habitId: 1, period: 'weekly', targetValue: 5 },
    { habitId: 2, period: 'weekly', targetValue: 7 },
    { habitId: 3, period: 'daily', targetValue: 8 },
    { habitId: 4, period: 'daily', targetValue: 1 },
  ]);

  console.log('Database seeded successfully');
}