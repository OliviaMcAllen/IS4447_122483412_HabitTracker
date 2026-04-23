// Based on Week 3-4 tutorials - Reusable form input component for consistent UI
// Demonstrates component composition and prop drilling patterns
// Used across add-habit, login, and other screens for consistent styling
// Week 3 tutorial: React props for passing data and callbacks to components

import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colours } from '../constants/colours';

// Type definition for FormField component props
// secureTextEntry prop added for password inputs (Week 4 tutorial on form security)
type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean; // New prop for password fields
};

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
  secureTextEntry = false,
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {/* TextInput component - controlled input pattern from Week 4 tutorial */}
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry} // Hide text for password inputs
        placeholderTextColor={colours.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: colours.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colours.borderColour,
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
    color: colours.textPrimary,
    backgroundColor: colours.cardBg,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});