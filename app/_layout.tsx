// Global authentication + app layout
// Based on Week 8 lecture (Context API for global state)
// and Expo Router tutorial for navigation structure

import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { colours } from '../constants/colours';
import { seedDatabaseIfEmpty } from '../db/seed';

// Auth context
// Week 8: Context API used to store global authentication state
// This allows all screens to access user, loading state and logout function
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
  // Week 3: useState used to manage user session and loading state
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Week 11: useEffect used to initialise database on app start
  // This ensures tables exist and seed data is inserted if needed
  useEffect(() => {
    const initialiseApp = async () => {
      try {
        console.log('Seeding database...');
        await seedDatabaseIfEmpty();
        console.log('Seed complete');
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        // Once setup is finished, stop loading
        setIsLoading(false);
      }
    };

    initialiseApp();
  }, []);

  // Week 8: logout clears the current user
  // Navigation changes automatically based on user being null
  const logout = () => {
    setUser(null);
  };

  // Prevent UI rendering until database is ready
  // Avoids errors and ensures data is loaded before screens appear
  if (isLoading) {
    return null;
  }

  return (
    // Week 8: Context Provider wraps entire app so all screens can access auth state
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>

      {/* Expo Router Stack controls navigation between screens */}
      <Stack screenOptions={{ headerShown: false }}>

        {/* If no user is logged in, only show login screen */}
        {!user ? (
          <Stack.Screen name="login" />
        ) : (
          // If user is logged in, show main app screens
          <>
            {/* Home screen */}
            <Stack.Screen
              name="index"
              options={{
                headerShown: true,
                title: 'Tide',
                // Week 4: consistent header styling for branding
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

            {/* Add Habit screen (shown as modal) */}
            <Stack.Screen
              name="add-habit"
              options={{
                title: 'Add Habit',
                presentation: 'modal',
                headerShown: true,
              }}
            />

            {/* Statistics screen */}
            <Stack.Screen
              name="stats"
              options={{
                title: 'Statistics',
                headerShown: true,
              }}
            />

            {/* Settings screen */}
            <Stack.Screen
              name="settings"
              options={{
                title: 'Settings',
                headerShown: true,
              }}
            />

            {/* Categories screen */}
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