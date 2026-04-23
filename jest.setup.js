jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execAsync: jest.fn(),
    execSync: jest.fn(), // 
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
  })),
}));