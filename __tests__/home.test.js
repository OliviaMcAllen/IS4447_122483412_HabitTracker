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

  expect(getByText('Tide')).toBeTruthy();
});