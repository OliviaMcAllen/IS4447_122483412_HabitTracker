// Based on Week 3-4 tutorials - Reusable form input component for consistent UI
// Used across add-habit, categories, and targets screens
import { StyleSheet, Text, TextInput, View } from 'react-native';

type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
};

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
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
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});