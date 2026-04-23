// Home screen test
// Based on React Native Testing Library and Jest mocking tutorials
// This test checks that the Home screen renders correctly with context and mocked navigation

// Mock Expo Router to avoid real navigation during tests
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

import { render } from '@testing-library/react-native';
import { AuthContext } from '../app/_layout';
import HomeScreen from '../app/index';

test('home renders title', () => {
  // Wrap component in AuthContext to provide required global state
  const { getByText } = render(
    <AuthContext.Provider
      value={{
        user: {},
        setUser: () => {},
        isLoading: false,
        logout: () => {},
      }}
    >
      <HomeScreen />
    </AuthContext.Provider>
  );

  // Check that the main title is rendered on screen
  expect(getByText('Tide')).toBeTruthy();
});