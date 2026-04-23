// Seed function test
// Based on basic Jest testing to verify functions are defined correctly
// This test ensures the seed function is available and can be called

import { seedDatabaseIfEmpty } from '../db/seed';

test('seed function exists', () => {
  // Check that the imported seed function is defined as a function
  expect(typeof seedDatabaseIfEmpty).toBe('function');
});