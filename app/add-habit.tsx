// Based on Week 4 tutorial - Form screen (controlled inputs)
// Week 3: useState/useEffect for managing form state
// Week 11: Drizzle ORM for CREATE and UPDATE operations
// Week 8: Context used for global loading state
// This version improves UI using Week 4 UX principles: hierarchy, spacing, clarity

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

  // Week 3: controlled form state
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Week 3: load initial data
  useEffect(() => {
    loadCategories();
    if (id) loadHabitForEditing(Number(id));
  }, [id]);

  const loadCategories = async () => {
    const result = await db.select().from(categoriesTable);
    setCategoryList(result as Category[]);
  };

  const loadHabitForEditing = async (habitId: number) => {
    const result = await db
      .select()
      .from(habitsTable)
      .where(eq(habitsTable.id, habitId));

    if (result.length > 0) {
      const habit = result[0];
      setHabitName(habit.name);
      setHabitDescription(habit.description || '');
      setSelectedCategory(habit.categoryId);
      setIsEditing(true);
    }
  };

  // Week 11: CREATE + UPDATE logic
  const saveHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Habit name is required');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && id) {
        await db
          .update(habitsTable)
          .set({
            name: habitName,
            description: habitDescription,
            categoryId: selectedCategory,
          })
          .where(eq(habitsTable.id, Number(id)));

        Alert.alert('Updated', 'Habit updated successfully');
      } else {
        await db.insert(habitsTable).values({
          name: habitName,
          description: habitDescription,
          categoryId: selectedCategory,
          createdAt: new Date().toISOString(),
        });

        Alert.alert('Created', 'Habit added successfully');
      }

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save habit');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header (Week 4: visual hierarchy) */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Habit' : 'New Habit'}
          </Text>
          <Text style={styles.subtitle}>
            Build consistency through small daily actions
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.card}>
          <FormField
            label="Habit Name"
            placeholder="e.g. Morning run"
            value={habitName}
            onChangeText={setHabitName}
          />

          <FormField
            label="Description"
            placeholder="Optional"
            value={habitDescription}
            onChangeText={setHabitDescription}
            multiline
          />
        </View>

        {/* Category Selector (Improved UI) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Category</Text>

          <View style={styles.categoryGrid}>
            {categoryList.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryItem,
                  selectedCategory === cat.id && styles.categoryItemActive,
                ]}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: cat.colour },
                  ]}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={saveHabit}
            disabled={isSaving}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryText}>
              {isSaving ? 'Saving...' : 'Save Habit'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.secondaryText}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Week 4: spacing + consistency = better UX
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F6F1',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
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
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryItemActive: {
    borderColor: '#0066CC',
    backgroundColor: '#F0F6FF',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  actions: {
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 10,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryText: {
    textAlign: 'center',
    color: '#6B7280',
    fontWeight: '600',
  },
});