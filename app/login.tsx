// Based on Week 4 tutorial - Login and registration screen
// Demonstrates form handling, user authentication, and database queries
// Week 3 tutorial: useState/useEffect hooks for form state management
// Week 11 tutorial: Drizzle ORM for user database queries

import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FormField from '../components/FormField';
import { colours } from '../constants/colours';
import { db } from '../db/client';
import { users } from '../db/schema';
import { AuthContext } from './_layout';

export default function LoginScreen() {
  const router = useRouter();
  // Access setUser and user from authentication context to update global user state
  const { setUser, user } = useContext(AuthContext);

  // If user is already logged in, redirect to home screen
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  // Form state management for login and registration modes
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle user login - query database for matching email and password
  // Uses Drizzle ORM to select user records (Week 11 tutorial)
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Query users table for matching email and password
      // In production, passwords would be hashed using bcrypt
      const result = await db.select().from(users);
      const foundUser = result.find(
        (u: any) => u.email === email && u.password === password
      );

      if (foundUser) {
        // Login successful - update global user state via context
        setUser({
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
        });
        Alert.alert('Success', `Welcome back, ${foundUser.name}`);
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user registration - insert new user into database
  // Uses Drizzle ORM insert method (Week 11 tutorial)
  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Check if user already exists
      const result = await db.select().from(users);
      const existingUser = result.find((u: any) => u.email === email);

      if (existingUser) {
        Alert.alert('Error', 'Email already registered');
        return;
      }

      // INSERT new user record into database
      await db.insert(users).values({
        email,
        password,
        name,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Account created! Please login');
      setIsRegistering(false); // Switch back to login mode
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundLight }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* App branding */}
        <View style={styles.header}>
          <Text style={styles.logo}>Habit Tracker</Text>
          <Text style={styles.subtitle}>
            {isRegistering ? 'Create an account' : 'Sign in to your account'}
          </Text>
        </View>

        {/* Form fields */}
        <View style={styles.formSection}>
          {isRegistering && (
            <FormField
              label="Full Name"
              placeholder="e.g., John Doe"
              value={name}
              onChangeText={setName}
            />
          )}

          <FormField
            label="Email"
            placeholder="e.g., user@example.com"
            value={email}
            onChangeText={setEmail}
          />

          <FormField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Submit button - either Login or Register */}
        <TouchableOpacity
          onPress={isRegistering ? handleRegister : handleLogin}
          disabled={isLoading}
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Loading...' : isRegistering ? 'Create Account' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Toggle between login and registration modes */}
        <TouchableOpacity
          onPress={() => {
            setIsRegistering(!isRegistering);
            setEmail('');
            setPassword('');
            setName('');
          }}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleButtonText}>
            {isRegistering
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </Text>
        </TouchableOpacity>

        {/* Demo credentials hint */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Demo Account</Text>
          <Text style={styles.demoText}>Email: demo@example.com</Text>
          <Text style={styles.demoText}>Password: password123</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: colours.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colours.textSecondary,
  },
  formSection: {
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: colours.accentBlue,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  toggleButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  toggleButtonText: {
    color: colours.accentBlue,
    fontWeight: '600',
    fontSize: 14,
  },
  demoSection: {
    backgroundColor: colours.backgroundDark,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colours.accentBlue,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colours.textPrimary,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: colours.textSecondary,
    marginBottom: 4,
  },
});