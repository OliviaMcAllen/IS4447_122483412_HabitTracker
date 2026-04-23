import { seedDatabaseIfEmpty } from '../db/seed';

test('seed function exists', () => {
  expect(typeof seedDatabaseIfEmpty).toBe('function');
});