// Stats screen
// Based on Week 3 (state and reactive updates), Week 4 (layout and visual hierarchy),
// Week 8 (Context API usage), and Week 11 (data aggregation with Drizzle ORM)

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { colours } from '../constants/colours';
import { db } from '../db/client';
import { habitLogs, habits as habitsTable, targets as targetsTable } from '../db/schema';
import { AuthContext } from './_layout';

// Get screen width for chart sizing
const screenWidth = Dimensions.get('window').width;

// Type for habit statistics
type HabitStat = {
  id: number;
  habitName: string;
  totalLogsThisWeek: number;
  totalLogsThisMonth: number;
  streak: number;
};

// Type for target progress tracking
type TargetProgress = {
  habitName: string;
  targetValue: number;
  currentValue: number;
  period: string;
  percentage: number;
};

export default function StatsScreen() {
  const { isLoading } = useContext(AuthContext);
  const router = useRouter();

  // Week 3: state to store calculated statistics
  const [habitStats, setHabitStats] = useState<HabitStat[]>([]);
  const [targetProgress, setTargetProgress] = useState<TargetProgress[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  // Week 3: reload data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, [])
  );

  // Helper function to get a date range for filtering logs
  const getDateRange = (days: number) => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    return start;
  };

  // Function to calculate streak of consecutive days
  // Loops backwards from today and counts continuous logs
  const calculateStreak = (logs: any[]) => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (logs.some((log) => log.date === dateStr)) {
        streak++;
      } else if (i > 0) break;
    }
    return streak;
  };

  // Week 11: load and aggregate data from database
  const loadStatistics = async () => {
    // Fetch all habits and logs
    const allHabits = await db.select().from(habitsTable);
    const allLogs = await db.select().from(habitLogs);

    // Build statistics per habit
    const stats = allHabits.map((habit: any) => {
      const logs = allLogs.filter((log: any) => log.habitId === habit.id);

      return {
        id: habit.id,
        habitName: habit.name,
        totalLogsThisWeek: logs.filter(
          (log: any) => new Date(log.date) >= getDateRange(7)
        ).length,
        totalLogsThisMonth: logs.filter(
          (log: any) => new Date(log.date) >= getDateRange(30)
        ).length,
        streak: calculateStreak(logs),
      };
    });

    setHabitStats(stats);

    // Fetch targets for progress tracking
    const allTargets = await db.select().from(targetsTable);

    // Calculate progress towards targets
    const progress = allTargets.map((target: any) => {
      const habit = allHabits.find((h: any) => h.id === target.habitId);
      const logs = allLogs.filter((log: any) => log.habitId === target.habitId);

      const currentValue = logs.reduce((sum, log: any) => sum + log.count, 0);
      const percentage = Math.min(100, (currentValue / target.targetValue) * 100);

      return {
        habitName: habit?.name || 'Unknown',
        targetValue: target.targetValue,
        currentValue,
        period: target.period,
        percentage,
      };
    });

    setTargetProgress(progress);
  };

  // Prevent rendering until data is ready
  if (isLoading) return null;

  // Prepare data for chart component
  const chartData = {
    labels: habitStats.map((h) => h.habitName.slice(0, 6)),
    datasets: [
      {
        data: habitStats.map((h) =>
          selectedPeriod === 'week'
            ? h.totalLogsThisWeek
            : h.totalLogsThisMonth
        ),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Back navigation */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        {/* Header section */}
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Your Daily Rhythm</Text>
        </View>

        {/* Toggle between weekly and monthly view */}
        <View style={styles.periodSelector}>
          {(['week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodActive,
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}
              >
                {period === 'week' ? 'Week' : 'Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activity chart */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Activity</Text>

          {habitStats.length === 0 ? (
            <Text style={styles.empty}>No data available</Text>
          ) : (
            <BarChart
              {...({
                data: chartData,
                width: screenWidth - 32,
                height: 200,
                fromZero: true,
                chartConfig: {
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0,102,204,${opacity})`,
                  labelColor: () => '#6B7280',
                },
                style: {
                  borderRadius: 10,
                },
              } as any)}
            />
          )}
        </View>

        {/* Streak display */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Streaks</Text>

          {habitStats.map((stat) => (
            <View key={stat.id} style={styles.row}>
              <Text style={styles.label}>{stat.habitName}</Text>
              <Text style={styles.streak}>{stat.streak} days</Text>
            </View>
          ))}
        </View>

        {/* Target progress display */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Targets</Text>

          {targetProgress.map((target, idx) => (
            <View key={idx} style={styles.targetItem}>
              <Text style={styles.label}>{target.habitName}</Text>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${target.percentage}%` },
                  ]}
                />
              </View>

              <Text style={styles.subText}>
                {target.currentValue} / {target.targetValue}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Styling based on Week 4 layout principles
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  back: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },

  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },

  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  periodActive: {
    backgroundColor: colours.accentBlue,
  },
  periodText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },

  sectionTitle: {
    fontWeight: '700',
    marginBottom: 10,
    color: '#111827',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: '#1F2937',
  },

  streak: {
    fontWeight: '700',
    color: '#F59E0B',
  },

  targetItem: {
    marginBottom: 12,
  },

  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 4,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colours.accentBlue,
    borderRadius: 3,
  },

  subText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  empty: {
    color: '#6B7280',
  },
});