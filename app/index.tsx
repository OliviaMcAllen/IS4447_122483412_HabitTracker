// Based on Week 4 tutorial - Home screen with habit management CRUD operations
// Demonstrates list rendering, state management with useState/useEffect, and database integration
// Week 11 tutorial pattern: Drizzle ORM for database queries
// Week 3 tutorial: React hooks (useState, useEffect) for state management

import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { colours } from '../constants/colours';
import { db } from '../db/client';
import { categories as categoriesTable, habitLogs, habits as habitsTable } from '../db/schema';
import { AuthContext } from './_layout';

// Type definitions for Habit and Category records
type Habit = {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  createdAt: string;
};

type Category = {
  id: number;
  name: string;
  colour: string;
  icon?: string;
};

export default function HomeScreen() {
  // Access authentication context to check if user is logged in
  const { isLoading } = useContext(AuthContext);
  const router = useRouter();
  
  // State management for habits, categories, search and filtering
  // Pattern from Week 3 tutorial on useState hook
  const [habitList, setHabitList] = useState<Habit[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);

  // useEffect hook runs once on component mount to load data
  // Empty dependency array [] means it only runs once (Week 3 tutorial pattern)
  useEffect(() => {
    loadData();
  }, []);

  // Load habits and categories from SQLite database
  // Uses Drizzle ORM pattern from Week 11 tutorial
  const loadData = async () => {
    try {
      const habitsResult = await db.select().from(habitsTable);
      setHabitList(habitsResult as Habit[]);

      const categoriesResult = await db.select().from(categoriesTable);
      setCategoryList(categoriesResult as Category[]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load habits');
    }
  };

  // Log habit completion by inserting a new record with today's date
  // Implements CREATE operation from CRUD pattern (Week 4 tutorial)
  const logHabitCompletion = async (habitId: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await db.insert(habitLogs).values({
        habitId,
        date: today,
        count: 1,
      });

      Alert.alert('Success', 'Habit logged!');
      await loadData();
    } catch (error) {
      console.error('Error logging habit:', error);
      Alert.alert('Error', 'Failed to log habit');
    }
  };

  // Delete habit and all associated logs
  // Implements DELETE operation from CRUD pattern (Week 4 tutorial)
  // Maintains referential integrity by deleting logs before habit
  const deleteHabit = async (habitId: number) => {
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            // Delete associated logs first to maintain referential integrity
            await db.delete(habitLogs).where(eq(habitLogs.habitId, habitId));
            // Then delete the habit
            await db.delete(habitsTable).where(eq(habitsTable.id, habitId));
            await loadData();
            Alert.alert('Success', 'Habit deleted');
          } catch (error) {
            console.error('Error deleting habit:', error);
            Alert.alert('Error', 'Failed to delete habit');
          }
        },
      },
    ]);
  };

  // Filter habits based on search query and selected category
  // Implements search and filter functionality requirement
  const filteredHabits = habitList.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategoryFilter || habit.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: number) => {
    return categoryList.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  // Helper function to get category colour by ID for visual distinction
  const getCategoryColour = (categoryId: number) => {
    return categoryList.find((c) => c.id === categoryId)?.colour || '#999';
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
        
        {/* Search bar for text-based filtering */}
        <View style={styles.searchSection}>
          <TextInput
            placeholder="Search habits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Category filter chips - allows filtering by category */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>FILTER BY CATEGORY</Text>
          <View style={styles.filterChips}>
            <TouchableOpacity
              onPress={() => setSelectedCategoryFilter(null)}
              style={[
                styles.filterChip,
                !selectedCategoryFilter && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !selectedCategoryFilter && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {categoryList.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategoryFilter(cat.id)}
                style={[
                  styles.filterChip,
                  selectedCategoryFilter === cat.id && { backgroundColor: cat.colour },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategoryFilter === cat.id && styles.filterChipTextActive,
                  ]}
                >
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Habits list or empty state */}
        {filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              {searchQuery || selectedCategoryFilter ? 'No habits found' : 'No habits yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedCategoryFilter
                ? 'Try adjusting your filters'
                : 'Create your first habit to get started!'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/add-habit')}
              style={styles.emptyStateButton}
            >
              <Text style={styles.emptyStateButtonText}>+ Add Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {filteredHabits.map((habit) => (
              <View
                key={habit.id}
                style={[
                  styles.habitCard,
                  { borderLeftColor: getCategoryColour(habit.categoryId) },
                ]}
              >
                <View style={styles.habitHeader}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitCategory}>
                    {getCategoryName(habit.categoryId)}
                  </Text>
                </View>

                {habit.description && (
                  <Text style={styles.habitDescription}>{habit.description}</Text>
                )}

                {/* Action buttons: Log, Edit, Delete */}
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    onPress={() => logHabitCompletion(habit.id)}
                    style={styles.logButton}
                  >
                    <Text style={styles.buttonText}>Log</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/add-habit?id=${habit.id}`)}
                    style={styles.editButton}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteHabit(habit.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add new habit button */}
        <TouchableOpacity
          onPress={() => router.push('/add-habit')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add New Habit</Text>
        </TouchableOpacity>
        
        {/* View statistics button */}
        <TouchableOpacity
          onPress={() => router.push('/stats')}
          style={styles.statsButton}
        >
          <Text style={styles.statsButtonText}>View Statistics</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 40,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colours.borderColour,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: colours.cardBg,
    color: colours.textPrimary,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    color: colours.textSecondary,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colours.backgroundDark,
  },
  filterChipActive: {
    backgroundColor: colours.accentBlue,
  },
  filterChipText: {
    color: colours.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: colours.textPrimary,
  },
  emptyStateText: {
    color: colours.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: colours.accentBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  habitCard: {
    backgroundColor: colours.cardBg,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  habitHeader: {
    marginBottom: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '700',
    color: colours.textPrimary,
  },
  habitCategory: {
    fontSize: 12,
    color: colours.textSecondary,
    marginTop: 4,
  },
  habitDescription: {
    fontSize: 13,
    color: colours.textSecondary,
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  logButton: {
    flex: 1,
    backgroundColor: colours.catHealth,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    flex: 1,
    backgroundColor: colours.accentBlue,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colours.catFitness,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: colours.accentBlue,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  statsButton: {
    backgroundColor: colours.catHealth,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  statsButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});