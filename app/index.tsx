// Based on Week 4 tutorial - Home screen with habit management CRUD operations
// Demonstrates list rendering, state management with useState/useEffect, and database integration
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../db/client';
import { categories as categoriesTable, habitLogs, habits as habitsTable } from '../db/schema';
import { AuthContext } from './_layout';

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
  const { isLoading } = useContext(AuthContext);
  const router = useRouter();
  
  const [habitList, setHabitList] = useState<Habit[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load habits from database (Week 11 Drizzle tutorial pattern)
      const habitsResult = await db.select().from(habitsTable);
      setHabitList(habitsResult as Habit[]);

      // Load categories
      const categoriesResult = await db.select().from(categoriesTable);
      setCategoryList(categoriesResult as Category[]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load habits');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const logHabitCompletion = async (habitId: number) => {
    try {
      // Insert new habit log entry with today's date
      const today = new Date().toISOString().split('T')[0];
      
      await db.insert(habitLogs).values({
        habitId,
        date: today,
        count: 1,
      });

      Alert.alert('Success', 'Habit logged! 🎉');
      await loadData();
    } catch (error) {
      console.error('Error logging habit:', error);
      Alert.alert('Error', 'Failed to log habit');
    }
  };

  const deleteHabit = async (habitId: number) => {
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            // Delete associated logs first (referential integrity)
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

  // Filter habits based on search and category selection
  const filteredHabits = habitList.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategoryFilter || habit.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: number) => {
    return categoryList.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryColour = (categoryId: number) => {
    return categoryList.find((c) => c.id === categoryId)?.colour || '#999';
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
     <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {/* Search bar */}
        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="Search habits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
              backgroundColor: '#fff',
            }}
          />
        </View>

        {/* Category filter chips */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: '#666' }}>
            FILTER BY CATEGORY
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedCategoryFilter(null)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: !selectedCategoryFilter ? '#6366f1' : '#e5e7eb',
              }}
            >
              <Text
                style={{
                  color: !selectedCategoryFilter ? '#fff' : '#666',
                  fontWeight: '500',
                  fontSize: 12,
                }}
              >
                All
              </Text>
            </TouchableOpacity>

            {categoryList.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategoryFilter(cat.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: selectedCategoryFilter === cat.id ? cat.colour : '#e5e7eb',
                }}
              >
                <Text
                  style={{
                    color: selectedCategoryFilter === cat.id ? '#fff' : '#666',
                    fontWeight: '500',
                    fontSize: 12,
                  }}
                >
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Habits list or empty state */}
        {filteredHabits.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
              {searchQuery || selectedCategoryFilter ? 'No habits found' : 'No habits yet'}
            </Text>
            <Text style={{ color: '#999', marginBottom: 20, textAlign: 'center' }}>
              {searchQuery || selectedCategoryFilter
                ? 'Try adjusting your filters'
                : 'Create your first habit to get started!'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/add-habit')}
              style={{
                backgroundColor: '#6366f1',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>+ Add Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {filteredHabits.map((habit) => (
              <View
                key={habit.id}
                style={{
                  backgroundColor: '#fff',
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: getCategoryColour(habit.categoryId),
                }}
              >
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
                    {habit.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    {getCategoryName(habit.categoryId)}
                  </Text>
                </View>

                {habit.description && (
                  <Text style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                    {habit.description}
                  </Text>
                )}

                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    onPress={() => logHabitCompletion(habit.id)}
                    style={{
                      flex: 1,
                      backgroundColor: '#10b981',
                      padding: 10,
                      borderRadius: 6,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>✓ Log</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/add-habit?id=${habit.id}`)}
                    style={{
                      flex: 1,
                      backgroundColor: '#3b82f6',
                      padding: 10,
                      borderRadius: 6,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>✏ Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteHabit(habit.id)}
                    style={{
                      flex: 1,
                      backgroundColor: '#ef4444',
                      padding: 10,
                      borderRadius: 6,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>× Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add habit button (floating) */}
        <TouchableOpacity
          onPress={() => router.push('/add-habit')}
          style={{
            backgroundColor: '#6366f1',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>+ Add New Habit</Text>
        </TouchableOpacity>
        
        {/* Stats button */}
        <TouchableOpacity
          onPress={() => router.push('/stats')}
          style={{
            backgroundColor: '#10b981',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>📊 View Statistics</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}