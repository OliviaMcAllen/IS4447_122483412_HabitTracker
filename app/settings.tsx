// Settings screen - refined UI
// Week 8: Context API for logout
// Week 3: useState for UI state
// Week 4: UX improvements (alignment, hierarchy)

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
import { AuthContext } from './_layout';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel' },
      {
        text: 'Sign out',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const toggleDarkMode = (value: boolean) => {
    setDarkModeEnabled(value);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your preferences</Text>
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          <Text style={styles.sectionTitleCentered}>Preferences</Text>

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Dark Mode</Text>
              <Text style={styles.subText}>Coming soon</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={toggleDarkMode}
              disabled
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.sectionTitleCentered}>About Tide</Text>

          <Text style={styles.aboutText}>
            Tide is a simple habit tracking app designed to help you build consistency
            through small daily actions. By focusing on routine and progress, it helps
            you stay aligned with your goals and create a steady daily rhythm.
          </Text>
        </View>

        {/* Account */}
        <View style={styles.card}>
          <Text style={styles.sectionTitleCentered}>Account</Text>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Styling improvements (Week 4 UX principles)
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F6F1',
  },

  container: {
    padding: 16,
    paddingBottom: 40,
  },

  backButton: {
    marginBottom: 10,
  },

  backText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },

  header: {
    marginBottom: 20,
    alignItems: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },

  sectionTitleCentered: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
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

  subText: {
    fontSize: 12,
    color: '#6B7280',
  },

  aboutText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    textAlign: 'center',
  },

  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 14,
  },
});