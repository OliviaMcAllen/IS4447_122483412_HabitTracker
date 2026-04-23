// Based on Week 4 tutorial - Form screen for adding/editing habits
// Demonstrates form handling with useState and database insert/update operations
// Week 11 tutorial: Drizzle ORM for database insert and update operations
// Week 3 tutorial: React hooks (useState, useEffect) for form state management

import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FormField from '../components/FormField';
import { colours } from '../constants/colours';
import { db } from '../db/client';
import { categories as categoriesTable, habits as habitsTable } from '../db/schema';
import { AuthContext } from './_layout';

// Type definition for Category record
type Category = {
  id: number;
  name: string;
  colour: string;
  icon?: string;
};

export default function AddHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get habit ID from route params for editing
  const { isLoading } = useContext(AuthContext);

  // Form state management using useState hook (Week 3 tutorial)
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // useEffect hook to load categories and habit data on mount
  // Pattern from Week 3 tutorial - empty dependency array [] means runs once
  useEffect(() => {
    loadCategories();
    if (id) {
      loadHabitForEditing(Number(id)); // Load existing habit if editing
    }
  }, [id]);

  // Load all categories from database for the selector
  // Uses Drizzle ORM pattern from Week 11 tutorial
  const loadCategories = async () => {
    try {
      const result = await db.select().from(categoriesTable);
      setCategoryList(result as Category[]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Load habit data when editing (READ operation from CRUD pattern)
  // Uses Drizzle ORM where clause to filter by habit ID
  const loadHabitForEditing = async (habitId: number) => {
    try {
      const result = await db.select().from(habitsTable).where(eq(habitsTable.id, habitId));
      if (result.length > 0) {
        const habit = result[0];
        setHabitName(habit.name);
        setHabitDescription(habit.description || '');
        setSelectedCategory(habit.categoryId);
        setIsEditing(true); // Flag that we are in edit mode
      }
    } catch (error) {
      console.error('Error loading habit:', error);
    }
  };

  // Save habit to database (CREATE or UPDATE operation from CRUD pattern)
  // Validates input before saving (Week 4 tutorial pattern for form validation)
  const saveHabit = async () => {
    // Validate that habit name is not empty
    if (!habitName.trim()) {
      Alert.alert('Error', 'Habit name is required');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && id) {
        // UPDATE operation - modify existing habit
        // Uses Drizzle ORM update and where clause (Week 11 tutorial)
        await db
          .update(habitsTable)
          .set({
            name: habitName,
            description: habitDescription,
            categoryId: selectedCategory,
          })
          .where(eq(habitsTable.id, Number(id)));

        Alert.alert('Success', 'Habit updated');
      } else {
        // CREATE operation - insert new habit
        // Uses Drizzle ORM insert method (Week 11 tutorial)
        await db.insert(habitsTable).values({
          name: habitName,
          description: habitDescription,
          categoryId: selectedCategory,
          createdAt: new Date().toISOString(),
        });

        Alert.alert('Success', 'Habit created');
      }

      router.back(); // Navigate back to home screen after save
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('Error', 'Failed to save habit');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while app initialises
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundLight }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEditing ? 'Edit Habit' : 'Create New Habit'}</Text>

        {/* Reusable FormField component for habit name input */}
        {/* Pattern from Week 4 tutorial on controlled form inputs */}
        <FormField
          label="Habit Name"
          placeholder="e.g., Morning Run"
          value={habitName}
          onChangeText={setHabitName}
        />

        {/* Reusable FormField component for description input */}
        <FormField
          label="Description (optional)"
          placeholder="e.g., 30 minutes run"
          value={habitDescription}
          onChangeText={setHabitDescription}
          multiline
        />

        {/* Category selector - allows user to pick which category this habit belongs to */}
        <View style={styles.categorySection}>
          <Text style={styles.label}>Select Category</Text>
          <View style={styles.categoryGrid}>
            {categoryList.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id && styles.categoryButtonSelected,
                  selectedCategory === cat.id && { backgroundColor: cat.colour },
                ]}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === cat.id && styles.categoryButtonTextSelected,
                  ]}
                >
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save button - submits form and saves to database */}
        <TouchableOpacity
          onPress={saveHabit}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Habit'}</Text>
        </TouchableOpacity>

        {/* Cancel button - closes modal without saving */}
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: colours.textPrimary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: colours.textPrimary,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colours.backgroundDark,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  categoryButtonText: {
    color: colours.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: colours.accentBlue,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colours.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
});