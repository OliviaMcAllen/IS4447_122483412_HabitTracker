// Jest setup file
// Based on testing setup from tutorials using Jest and React Native Testing Library
// This file mocks external modules so tests can run without real database access

// Mock Expo SQLite to prevent real database calls during tests
// Instead of connecting to a real database, fake functions are used
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execAsync: jest.fn(),
    execSync: jest.fn(),
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
  })),
}));