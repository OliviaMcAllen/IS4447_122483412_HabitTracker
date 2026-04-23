// Global authentication + app layout
// FIXED: Proper Expo Router auth flow + correct Stack structure

import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { colours } from '../constants/colours';
import { seedDatabaseIfEmpty } from '../db/seed';

// Auth context
export const AuthContext = createContext<{
  user: any;
  setUser: (user: any) => void;
  isLoading: boolean;
  logout: () => void;
}>({
  user: null,
  setUser: () => {},
  isLoading: true,
  logout: () => {},
});

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialise database on app start
  useEffect(() => {
    const initialiseApp = async () => {
      try {
        console.log('Seeding database...');
        await seedDatabaseIfEmpty();
        console.log('Seed complete');
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialiseApp();
  }, []);

  const logout = () => {
    setUser(null);
  };

  // Prevent rendering until ready
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      <Stack screenOptions={{ headerShown: false }}>

        {!user ? (
          // 🔐 LOGIN FLOW
          <Stack.Screen name="login" />
        ) : (
          // 🔓 APP SCREENS
          <>
            <Stack.Screen
              name="index"
              options={{
                headerShown: true,
                title: 'Tide',
                headerStyle: {
                  backgroundColor: colours.accentBlue,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: '600',
                  fontSize: 16,
                },
              }}
            />

            <Stack.Screen
              name="add-habit"
              options={{
                title: 'Add Habit',
                presentation: 'modal',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="stats"
              options={{
                title: 'Statistics',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="settings"
              options={{
                title: 'Settings',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="categories"
              options={{
                title: 'Categories',
                headerShown: true,
              }}
            />
          </>
        )}

      </Stack>
    </AuthContext.Provider>
  );
}