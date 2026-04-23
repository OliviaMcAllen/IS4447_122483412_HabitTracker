// Based on Week 4 tutorial - Home screen with habit management
// Week 3: useState + useFocusEffect for dynamic UI updates
// Week 8: AuthContext for global authentication state
// Week 11: Drizzle ORM for database reads/writes
// UI updated using Week 4 UX principles: hierarchy, spacing, navigation clarity

import { eq } from 'drizzle-orm';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colours } from '../constants/colours';
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
};

type HabitWithCompletion = Habit & {
  completedToday: boolean;
};

export default function HomeScreen() {
  const { isLoading } = useContext(AuthContext);
  const router = useRouter();

  // Week 3: Local state for UI rendering
  const [habitList, setHabitList] = useState<HabitWithCompletion[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Week 11: reload data when screen is focused
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

      setHabitList(habitsWithCompletion as HabitWithCompletion[]);
      setCategoryList(categoriesResult as Category[]);

      const completed = habitsWithCompletion.filter((h: any) => h.completedToday).length;
      setCompletedCount(completed);
    } catch {
      Alert.alert('Error', 'Failed to load habits');
    }
  };

  // Week 4: CRUD interaction (toggle completion)
  const toggleHabitCompletion = async (habitId: number, completedToday: boolean) => {
    try {
      const today = getTodayDate();

      if (completedToday) {
        const logsToDelete = await db
          .select()
          .from(habitLogs)
          .where(eq(habitLogs.habitId, habitId));

        const logToDelete = logsToDelete.find(
          (log: any) => log.date === today && log.habitId === habitId
        );

        if (logToDelete) {
          await db.delete(habitLogs).where(eq(habitLogs.id, logToDelete.id));
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
          await db.delete(habitLogs).where(eq(habitLogs.habitId, habitId));
          await db.delete(habitsTable).where(eq(habitsTable.id, habitId));
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
    habitList.length > 0 ? (completedCount / habitList.length) * 100 : 0;

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

        {/* Header (Week 4: visual hierarchy) */}
        <View style={styles.header}>
          <Text style={styles.title}>Tide</Text>
          <Text style={styles.subtitle}>Your Daily Rhythm</Text>
        </View>

        {/* Navigation buttons (Week 4 UX: quick access) */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => router.push('/stats')}
            style={styles.navPrimary}
          >
            <Text style={styles.navPrimaryText}>Statistics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.navSecondary}
          >
            <Text style={styles.navSecondaryText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.card}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>
              {completedCount} / {habitList.length}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        {/* Habit List */}
        {habitList.map((habit) => (
          <View
            key={habit.id}
            style={[
              styles.habitCard,
              { borderLeftColor: getCategoryColour(habit.categoryId) },
            ]}
          >
            <TouchableOpacity
              onPress={() => toggleHabitCompletion(habit.id, habit.completedToday)}
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

            <TouchableOpacity onPress={() => deleteHabit(habit.id)}>
              <Text style={styles.deleteText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Primary Action */}
        <TouchableOpacity
          onPress={() => router.push('/add-habit')}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Add Habit</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// Styling (Week 4: spacing, alignment, consistency)
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
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },

  navRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  navPrimary: {
    flex: 1,
    backgroundColor: colours.accentBlue,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  navPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  navSecondary: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navSecondaryText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13,
  },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressValue: {
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colours.accentBlue,
  },

  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
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
  },
  checkboxChecked: {
    backgroundColor: colours.accentBlue,
    borderColor: colours.accentBlue,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontWeight: '600',
    fontSize: 14,
  },
  habitMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteText: {
    fontSize: 12,
    color: '#DC2626',
  },

  primaryButton: {
    backgroundColor: colours.accentBlue,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});