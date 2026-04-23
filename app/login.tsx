// Login screen
// Based on Week 3 (useState for form handling), Week 4 (layout and UI structure),
// Week 8 (Context API for authentication), and Week 11 (Drizzle ORM for database queries)

import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FormField from '../components/FormField';
import { colours } from '../constants/colours';
import { db } from '../db/client';
import { users } from '../db/schema';
import { AuthContext } from './_layout';

export default function LoginScreen() {
  const router = useRouter();

  // Week 8: access global auth state and setter
  const { setUser, user } = useContext(AuthContext);

  // Week 8: if a user is already logged in, redirect to home screen
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user]);

  // Week 3: controlled form state for inputs
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login function
  // Week 11: reads from database and checks if user exists
  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Fetch all users from database
      const result = await db.select().from(users);

      // Find matching user
      const foundUser = result.find(
        (u: any) => u.email === email && u.password === password
      );

      if (foundUser) {
        // Set global user state
        setUser(foundUser);
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch {
      Alert.alert('Error', 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  // Week 11: inserts new user into database
  const handleRegister = async () => {
    // Validation for all fields
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const result = await db.select().from(users);
      const exists = result.find((u: any) => u.email === email);

      if (exists) {
        Alert.alert('Error', 'Email already registered');
        return;
      }

      // Insert new user
      await db.insert(users).values({
        email,
        password,
        name,
        createdAt: new Date().toISOString(),
      });

      // Reset form and switch back to login
      Alert.alert('Success', 'Account created');
      setIsRegistering(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch {
      Alert.alert('Error', 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>

        {/* Header section showing app name */}
        <View style={styles.header}>
          <Text style={styles.title}>Tide</Text>
          <Text style={styles.subtitle}>Your Daily Rhythm</Text>
        </View>

        {/* Form section */}
        <View style={styles.form}>

          {/* Only show name field when registering */}
          {isRegistering && (
            <FormField
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          )}

          {/* Email input */}
          <FormField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password input */}
          <FormField
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Submit button switches between login and register */}
          <TouchableOpacity
            onPress={isRegistering ? handleRegister : handleLogin}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {isLoading
                ? 'Loading...'
                : isRegistering
                ? 'Create Account'
                : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Toggle between login and register modes */}
          <TouchableOpacity
            onPress={() => {
              setIsRegistering(!isRegistering);
              setEmail('');
              setPassword('');
              setName('');
            }}
          >
            <Text style={styles.toggle}>
              {isRegistering
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

// Styling section based on Week 4 layout principles
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F6F1',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  header: {
    alignItems: 'center',
    marginBottom: 40,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  form: {
    width: '100%',
  },

  button: {
    backgroundColor: colours.accentBlue,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  toggle: {
    textAlign: 'center',
    marginTop: 14,
    color: colours.accentBlue,
    fontWeight: '600',
    fontSize: 13,
  },
});