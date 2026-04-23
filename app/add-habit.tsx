// Based on Week 4 tutorial - Form screen for adding/editing habits
// Demonstrates form handling with useState and database insert/update operations
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
import { db } from '../db/client';
import { categories as categoriesTable, habits as habitsTable } from '../db/schema';
import { AuthContext } from './_layout';

type Category = {
  id: number;
  name: string;
  colour: string;
  icon?: string;
};

export default function AddHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isLoading } = useContext(AuthContext);

  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCategories();
    if (id) {
      loadHabitForEditing(Number(id));
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const result = await db.select().from(categoriesTable);
      setCategoryList(result as Category[]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadHabitForEditing = async (habitId: number) => {
    try {
      const result = await db.select().from(habitsTable).where(eq(habitsTable.id, habitId));
      if (result.length > 0) {
        const habit = result[0];
        setHabitName(habit.name);
        setHabitDescription(habit.description || '');
        setSelectedCategory(habit.categoryId);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading habit:', error);
    }
  };

  const saveHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Habit name is required');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && id) {
        // Update existing habit
        await db
          .update(habitsTable)
          .set({
            name: habitName,
            description: habitDescription,
            categoryId: selectedCategory,
          })
          .where(eq(habitsTable.id, Number(id)));

        Alert.alert('Success', 'Habit updated!');
      } else {
        // Create new habit
        await db.insert(habitsTable).values({
          name: habitName,
          description: habitDescription,
          categoryId: selectedCategory,
          createdAt: new Date().toISOString(),
        });

        Alert.alert('Success', 'Habit created!');
      }

      router.back();
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('Error', 'Failed to save habit');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEditing ? 'Edit Habit' : 'Create New Habit'}</Text>

        {/* Form fields */}
        <FormField
          label="Habit Name"
          placeholder="e.g., Morning Run"
          value={habitName}
          onChangeText={setHabitName}
        />

        <FormField
          label="Description (optional)"
          placeholder="e.g., 30 minutes run"
          value={habitDescription}
          onChangeText={setHabitDescription}
          multiline
        />

        {/* Category selector */}
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

        {/* Save button */}
        <TouchableOpacity
          onPress={saveHabit}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Habit'}</Text>
        </TouchableOpacity>

        {/* Cancel button */}
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
    color: '#1f2937',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
    backgroundColor: '#e5e7eb',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  categoryButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 12,
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#6366f1',
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
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
  },
});