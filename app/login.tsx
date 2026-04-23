// Login screen - Clean centred UI
// Week 3: useState for form handling
// Week 8: AuthContext for global state
// Week 11: Drizzle ORM for database queries

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
  const { setUser, user } = useContext(AuthContext);

  // Week 8: Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user]);

  // Week 3: Form state
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // LOGIN
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await db.select().from(users);

      const foundUser = result.find(
        (u: any) => u.email === email && u.password === password
      );

      if (foundUser) {
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

  // REGISTER
  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await db.select().from(users);
      const exists = result.find((u: any) => u.email === email);

      if (exists) {
        Alert.alert('Error', 'Email already registered');
        return;
      }

      await db.insert(users).values({
        email,
        password,
        name,
        createdAt: new Date().toISOString(),
      });

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

        {/* Branding - centred (Week 4 UX hierarchy) */}
        <View style={styles.header}>
          <Text style={styles.title}>Tide</Text>
          <Text style={styles.subtitle}>Your Daily Rhythm</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {isRegistering && (
            <FormField
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          )}

          <FormField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
          />

          <FormField
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Primary Button */}
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

          {/* Toggle */}
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

// Styling (Week 4: clean spacing + alignment)
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