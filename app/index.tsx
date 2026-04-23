// Home screen
// Week 3: state and re-rendering
// Week 4: layout and UI structure
// Week 8: Context API
// Week 11: Drizzle ORM

import { eq } from 'drizzle-orm';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colours } from '../constants/colours';
import { db } from '../db/client';
import {
  categories as categoriesTable,
  habitLogs,
  habits as habitsTable,
} from '../db/schema';
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
};

type HabitWithCompletion = Habit & {
  completedToday: boolean;
};

export default function HomeScreen() {
  const { isLoading } = useContext(AuthContext);
  const router = useRouter();

  const [habitList, setHabitList] = useState<HabitWithCompletion[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const habitsResult = await db.select().from(habitsTable);
      const categoriesResult = await db.select().from(categoriesTable);
      const logsResult = await db.select().from(habitLogs);

      const today = getTodayDate();

      const habitsWithCompletion = habitsResult.map((habit: any) => ({
        ...habit,
        completedToday: logsResult.some(
          (log: any) => log.habitId === habit.id && log.date === today
        ),
      }));

      setHabitList(habitsWithCompletion);
      setCategoryList(categoriesResult);

      const completed = habitsWithCompletion.filter(
        (h: any) => h.completedToday
      ).length;
      setCompletedCount(completed);
    } catch {
      Alert.alert('Error', 'Failed to load habits');
    }
  };

  const toggleHabitCompletion = async (
    habitId: number,
    completedToday: boolean
  ) => {
    try {
      const today = getTodayDate();

      if (completedToday) {
        const logs = await db
          .select()
          .from(habitLogs)
          .where(eq(habitLogs.habitId, habitId));

        const log = logs.find((l: any) => l.date === today);

        if (log) {
          await db.delete(habitLogs).where(eq(habitLogs.id, log.id));
        }
      } else {
        await db.insert(habitLogs).values({
          habitId,
          date: today,
          count: 1,
        });
      }

      await loadData();
    } catch {
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const deleteHabit = async (habitId: number) => {
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await db
            .delete(habitLogs)
            .where(eq(habitLogs.habitId, habitId));
          await db
            .delete(habitsTable)
            .where(eq(habitsTable.id, habitId));
          await loadData();
        },
      },
    ]);
  };

  const getCategoryName = (id: number) =>
    categoryList.find((c) => c.id === id)?.name || 'Unknown';

  const getCategoryColour = (id: number) =>
    categoryList.find((c) => c.id === id)?.colour || '#999';

  const progressPercentage =
    habitList.length > 0
      ? (completedCount / habitList.length) * 100
      : 0;

  const filteredHabits = habitList
    .filter(
      (h) =>
        selectedCategory === null || h.categoryId === selectedCategory
    )
    .filter((h) =>
      h.name.toLowerCase().includes(search.toLowerCase())
    );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tide</Text>
          <Text style={styles.subtitle}>Your Daily Rhythm</Text>
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => router.push('/stats')}
            style={styles.navSecondary}
          >
            <Text style={styles.navSecondaryText}>Statistics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.navSecondary}
          >
            <Text style={styles.navSecondaryText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TextInput
          placeholder="Search habits..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.filterChip,
              selectedCategory === null && styles.filterAllActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === null && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categoryList.map((cat) => {
            const isActive = selectedCategory === cat.id;

            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? cat.colour
                      : `${cat.colour}20`,
                    borderColor: cat.colour,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isActive ? '#fff' : cat.colour,
                      fontWeight: isActive ? '700' : '600',
                    },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Progress */}
        <View style={styles.card}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>
              {completedCount} / {habitList.length}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        </View>

        {/* Habit list */}
        {filteredHabits.length === 0 ? (
          <Text style={styles.emptyText}>No habits found</Text>
        ) : (
          filteredHabits.map((habit) => (
            <View
              key={habit.id}
              style={[
                styles.habitCard,
                {
                  borderLeftColor: getCategoryColour(
                    habit.categoryId
                  ),
                },
              ]}
            >
              <TouchableOpacity
                onPress={() =>
                  toggleHabitCompletion(
                    habit.id,
                    habit.completedToday
                  )
                }
                style={[
                  styles.checkbox,
                  habit.completedToday && styles.checkboxChecked,
                ]}
              />

              <View style={styles.habitInfo}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.habitMeta}>
                  {getCategoryName(habit.categoryId)}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/add-habit?id=${habit.id}`)
                  }
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteHabit(habit.id)}
                >
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Add button */}
        <TouchableOpacity
          onPress={() => router.push('/add-habit')}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Add Habit
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F6F1' },
  container: { padding: 16, paddingBottom: 40 },

  header: { marginBottom: 18 },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },

  navRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  navSecondary: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navSecondaryText: {
    color: '#374151',
    fontWeight: '600',
  },

  search: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },

  filterScroll: { marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterAllActive: { backgroundColor: colours.accentBlue },
  filterText: { fontSize: 12 },
  filterTextActive: { color: '#fff' },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13, color: '#6B7280' },
  progressValue: { fontWeight: '700' },

  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 6,
  },
  progressFill: { height: '100%', backgroundColor: colours.accentBlue },

  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    borderLeftWidth: 4,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 12,
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: colours.accentBlue,
    borderColor: colours.accentBlue,
  },

  habitInfo: { flex: 1 },
  habitName: { fontWeight: '600', fontSize: 14 },
  habitMeta: { fontSize: 12, color: '#6B7280' },

  actions: { alignItems: 'flex-end', gap: 6 },
  editText: {
    fontSize: 12,
    color: colours.accentBlue,
    fontWeight: '600',
  },
  deleteText: { fontSize: 12, color: '#DC2626' },

  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },

  primaryButton: {
    backgroundColor: colours.accentBlue,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});