// Jest configuration file
// Based on testing setup from tutorials using Jest and React Native Testing Library

module.exports = {
  // Uses the Expo preset to configure Jest for React Native and Expo apps
  preset: 'jest-expo',

  // Runs setup files after the test environment is ready
  // First extends Jest with React Native specific matchers
  // Second runs custom setup (e.g. mocks or global configs)
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    './jest.setup.js',
  ],
};