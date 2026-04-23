// Seed script - FINAL FIXED VERSION

import { db } from './client';
import { categories, habitLogs, habits, targets, users } from './schema';

export async function seedDatabaseIfEmpty() {
  console.log('SEED FUNCTION RUNNING');

  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);

    if (existingUsers.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('No users found, seeding database...');

    // Insert users
    await db.insert(users).values([
      {
        email: 'demo@example.com',
        password: 'password123',
        name: 'Demo User',
        createdAt: new Date().toISOString(),
      },
    ]);

    console.log('Users inserted');

    // Insert categories
    await db.insert(categories).values([
      { name: 'Fitness', colour: '#EF4444', icon: 'F' },
      { name: 'Learning', colour: '#3B82F6', icon: 'L' },
      { name: 'Health', colour: '#10B981', icon: 'H' },
      { name: 'Productivity', colour: '#F59E0B', icon: 'P' },
    ]);

    console.log('Categories inserted');

    // Insert habits
    await db.insert(habits).values([
      {
        name: 'Morning Run',
        description: '30 min run',
        categoryId: 1,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Read Book',
        description: 'Read for 1 hour',
        categoryId: 2,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Drink Water',
        description: '8 glasses daily',
        categoryId: 3,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Meditate',
        description: '10 min meditation',
        categoryId: 3,
        createdAt: new Date().toISOString(),
      },
    ]);

    console.log('Habits inserted');

    // Insert logs
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    await db.insert(habitLogs).values([
      { habitId: 1, date: today, count: 1, notes: 'Good pace' },
      { habitId: 1, date: yesterday, count: 1, notes: 'Rainy day' },
      { habitId: 2, date: today, count: 1, notes: 'Finished chapter 5' },
      { habitId: 3, date: today, count: 8, notes: '' },
      { habitId: 4, date: today, count: 1, notes: 'Felt calm' },
    ]);

    console.log('Logs inserted');

    // Insert targets
    await db.insert(targets).values([
      { habitId: 1, period: 'weekly', targetValue: 5 },
      { habitId: 2, period: 'weekly', targetValue: 7 },
      { habitId: 3, period: 'daily', targetValue: 8 },
      { habitId: 4, period: 'daily', targetValue: 1 },
    ]);

    console.log('Targets inserted');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}