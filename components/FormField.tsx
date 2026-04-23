// Reusable FormField component
// Based on Week 3 and Week 4 tutorials on reusable components,
// props, controlled inputs, and consistent form design

import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colours } from '../constants/colours';

// Type definition for FormField props
// Week 3: props used to pass values and callbacks into reusable components
// Week 4: secureTextEntry supports password input fields
type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
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
      {/* Label shown above input field */}
      <Text style={styles.label}>{label}</Text>

      {/* TextInput uses controlled input pattern from Week 4 */}
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={colours.textSecondary}
      />
    </View>
  );
}

// Styling focused on consistency across screens
// Week 4: spacing, alignment and readable form layout
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