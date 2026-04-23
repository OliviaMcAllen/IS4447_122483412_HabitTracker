// Based on Week 11 tutorial - App layout with Expo Router navigation and authentication context
// This file is the root of the app and handles:
// 1. Database initialisation on startup
// 2. Authentication state management using React Context (Week 4 tutorial pattern)
// 3. Navigation structure using Expo Router Stack

import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { colours } from '../constants/colours';
import { seedDatabaseIfEmpty } from '../db/seed';

// Authentication context - allows all screens to access user state without prop drilling
// Pattern from Week 4 tutorial on useContext hook
// CRITICAL: Must be exported so other screens can import it
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
  // State management using useState hook (Week 3 tutorial)
  const [user, setUser] = useState<any>(null); // Stores logged-in user data
  const [isLoading, setIsLoading] = useState(true); // Flag for app initialisation

  // useEffect hook runs once on app startup (Week 3 tutorial)
  // Empty dependency array [] means it only runs once, on mount
  useEffect(() => {
    // Initialise database with seed data on app startup
    // Seed function from db/seed.ts populates sample data for demonstration
    const initialiseApp = async () => {
      try {
        // Call seed function - only seeds if database is empty
        await seedDatabaseIfEmpty();
        setIsLoading(false); // Mark app as ready
      } catch (error) {
        console.error('Failed to initialise app:', error);
        setIsLoading(false); // Mark app as ready even if seed fails
      }
    };

    initialiseApp();
  }, []);

  // Logout function - clears user state and returns to login screen
  const logout = () => {
    setUser(null);
  };

  // Provide authentication context to all child screens
  // This pattern allows screens like index.tsx to access user state via useContext(AuthContext)
  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {/* Stack navigation structure - defines all screens in the app */}
      {/* Pattern from Week 11 tutorial on navigation */}
      <Stack
        screenOptions={{
          // Default header styling for all screens
          headerShown: true,
          headerStyle: {
            backgroundColor: colours.accentBlue,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      >
        {/* Login screen - shown when user is null (not authenticated) */}
        {/* All screens must be registered at top level in Expo Router */}
        <Stack.Screen
          name="login"
          options={{
            title: 'Habit Tracker',
            headerShown: true,
          }}
        />

        {/* Home screen - displays list of habits */}
        <Stack.Screen
          name="index"
          options={{
            title: 'Habit Tracker',
            headerShown: true,
          }}
        />

        {/* Add/Edit habit screen - modal presentation slides up from bottom */}
        <Stack.Screen
          name="add-habit"
          options={{
            title: 'Add Habit',
            presentation: 'modal',
          }}
        />

        {/* Statistics screen - shows charts and insights */}
        <Stack.Screen
          name="stats"
          options={{
            title: 'Statistics',
          }}
        />

        {/* Categories management screen */}
        <Stack.Screen
          name="categories"
          options={{
            title: 'Categories',
          }}
        />
      </Stack>
    </AuthContext.Provider>
  );
}