// Settings screen
// Based on Week 3 (useState for UI state), Week 4 (layout and structure),
// Week 8 (Context API for authentication), and Week 11 (Drizzle ORM for database operations)

import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../db/client';
import { users } from '../db/schema';
import { AuthContext } from './_layout';

export default function SettingsScreen() {
  const router = useRouter();

  // Week 8: access global auth state and logout function
  const { logout, user } = useContext(AuthContext);

  // Week 3: local UI state for toggle (not yet functional)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Handles user logout with confirmation
  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Sign out',
        onPress: () => {
          logout(); // clear user from global state
          router.replace('/login'); // navigate back to login screen
        },
      },
    ]);
  };

  // Handles account deletion
  // Week 11: deletes user from database using Drizzle ORM
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Ensure user exists before attempting delete
              if (!user?.id) return;

              // Delete user from database
              await db.delete(users).where(eq(users.id, user.id));

              // Clear auth state after deletion
              logout();

            } catch {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Navigation back button */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        {/* Header section */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your preferences</Text>
        </View>

        {/* Preferences section */}
        <View style={styles.card}>
          <Text style={styles.section}>Preferences</Text>

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Dark Mode</Text>
              <Text style={styles.sub}>Coming soon</Text>
            </View>

            {/* Switch currently disabled as feature not implemented */}
            <Switch value={darkModeEnabled} disabled />
          </View>
        </View>

        {/* About section describing the app */}
        <View style={styles.card}>
          <Text style={styles.section}>About Tide</Text>

          <Text style={styles.about}>
            Tide is a habit tracking app designed to help users build consistency
            through simple daily actions. By focusing on routine, progress, and
            small achievable goals, it supports users in developing long-term habits.
            
            The app allows users to track their daily behaviours, monitor progress
            over time, and stay aligned with personal goals in a clear and structured way.
          </Text>
        </View>

        {/* Account management section */}
        <View style={styles.card}>
          <Text style={styles.section}>Account</Text>

          {/* Logout button */}
          <TouchableOpacity onPress={handleLogout} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>

          {/* Delete account button */}
          <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Styling based on Week 4 layout principles (spacing, alignment, hierarchy)
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F6F1',
  },
  container: {
    padding: 16,
  },
  back: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },

  section: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2563EB', 
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: 13,
    color: '#1F2937',
  },

  sub: {
    fontSize: 12,
    color: '#6B7280',
  },

  about: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  signOutButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },

  signOutText: {
    color: '#fff',
    fontWeight: '600',
  },

  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});