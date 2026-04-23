// Seed script
// Based on Week 11 Drizzle ORM tutorial
// This file inserts initial demo data into the SQLite database for testing and development

import { db } from './client';
import { categories, habitLogs, habits, targets, users } from './schema';

export async function seedDatabaseIfEmpty() {
  console.log('SEED FUNCTION RUNNING');

  try {
    // Clear all existing data to ensure a fresh seed each time the app runs
    // This helps avoid duplicates and keeps the dataset consistent for testing
    await db.delete(habitLogs);
    await db.delete(habits);
    await db.delete(targets);
    await db.delete(categories);
    await db.delete(users);

    // Check if categories already exist to determine if seeding is needed
    const existingCategories = await db.select().from(categories).limit(1);

    if (existingCategories.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('No categories found, seeding database...');

    // Insert a demo user for login functionality
    await db.insert(users).values([
      {
        email: 'demo@example.com',
        password: 'password123',
        name: 'Demo User',
        createdAt: new Date().toISOString(),
      },
    ]);

    console.log('Users inserted');

    // Insert predefined categories used for organising habits
    await db.insert(categories).values([
      { name: 'Fitness', colour: '#EF4444', icon: 'F' },
      { name: 'Learning', colour: '#3B82F6', icon: 'L' },
      { name: 'Health', colour: '#10B981', icon: 'H' },
      { name: 'Productivity', colour: '#F59E0B', icon: 'P' },
    ]);

    console.log('Categories inserted');

    // Retrieve categories from database to get their generated ids
    const allCategories = await db.select().from(categories);

    const fitnessCategory = allCategories.find((c: any) => c.name === 'Fitness');
    const learningCategory = allCategories.find((c: any) => c.name === 'Learning');
    const healthCategory = allCategories.find((c: any) => c.name === 'Health');

    // Validate that categories exist before continuing
    if (!fitnessCategory || !learningCategory || !healthCategory) {
      throw new Error('Seed failed: categories not found after insert');
    }

    // Insert habits using the correct category ids from the database
    await db.insert(habits).values([
      {
        name: 'Morning Run',
        description: '30 min run',
        categoryId: fitnessCategory.id,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Read Book',
        description: 'Read for 1 hour',
        categoryId: learningCategory.id,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Drink Water',
        description: '8 glasses daily',
        categoryId: healthCategory.id,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Meditate',
        description: '10 min meditation',
        categoryId: healthCategory.id,
        createdAt: new Date().toISOString(),
      },
    ]);

    console.log('Habits inserted');

    // Retrieve habits to get their ids for logs and targets
    const allHabits = await db.select().from(habits);

    const morningRun = allHabits.find((h: any) => h.name === 'Morning Run');
    const readBook = allHabits.find((h: any) => h.name === 'Read Book');
    const drinkWater = allHabits.find((h: any) => h.name === 'Drink Water');
    const meditate = allHabits.find((h: any) => h.name === 'Meditate');

    // Validate habits exist before inserting related data
    if (!morningRun || !readBook || !drinkWater || !meditate) {
      throw new Error('Seed failed: habits not found after insert');
    }

    // Generate dates for log entries
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Insert habit completion logs
    await db.insert(habitLogs).values([
      { habitId: morningRun.id, date: today, count: 1, notes: 'Good pace' },
      { habitId: morningRun.id, date: yesterday, count: 1, notes: 'Rainy day' },
      { habitId: readBook.id, date: today, count: 1, notes: 'Finished chapter 5' },
      { habitId: drinkWater.id, date: today, count: 8, notes: '' },
      { habitId: meditate.id, date: today, count: 1, notes: 'Felt calm' },
    ]);

    console.log('Logs inserted');

    // Insert target goals for each habit used in statistics screen
    await db.insert(targets).values([
      { habitId: morningRun.id, period: 'weekly', targetValue: 5 },
      { habitId: readBook.id, period: 'weekly', targetValue: 7 },
      { habitId: drinkWater.id, period: 'daily', targetValue: 8 },
      { habitId: meditate.id, period: 'daily', targetValue: 1 },
    ]);

    console.log('Targets inserted');
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}