// Based on Week 8-9 tutorials - Statistics and insights screen
// Week 3: useState + useFocusEffect for reactive UI updates
// Week 8: Context API for global auth state
// Week 11: Drizzle ORM for querying and aggregating SQLite data

import { useFocusEffect } from 'expo-router';
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

const screenWidth = Dimensions.get('window').width;

// Week 3: structured types for predictable state
type HabitStat = {
  id: number;
  habitName: string;
  totalLogsThisWeek: number;
  totalLogsThisMonth: number;
  streak: number;
};

type TargetProgress = {
  habitName: string;
  targetValue: number;
  currentValue: number;
  period: string;
  percentage: number;
};

export default function StatsScreen() {
  const { isLoading } = useContext(AuthContext);

  const [habitStats, setHabitStats] = useState<HabitStat[]>([]);
  const [targetProgress, setTargetProgress] = useState<TargetProgress[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  // Week 11: reload data when navigating back to screen
  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, [])
  );

  const getDateRange = (days: number) => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    return start;
  };

  // Week 11: calculate streak (consecutive days logic)
  const calculateStreak = (logs: any[]) => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (logs.some((log) => log.date === dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  // Week 11: data aggregation using Drizzle ORM
  const loadStatistics = async () => {
    const allHabits = await db.select().from(habitsTable);
    const allLogs = await db.select().from(habitLogs);

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

    const allTargets = await db.select().from(targetsTable);

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

  if (isLoading) return null;

  // Chart data (typed for stability)
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

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Your Daily Rhythm</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'week' ? 'Week' : 'Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Activity</Text>

          {habitStats.length === 0 ? (
            <Text style={styles.emptyText}>No data available</Text>
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
              } as any)}
            />
          )}
        </View>

        {/* Streaks */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Streaks</Text>

          {habitStats.map((stat) => (
            <View key={stat.id} style={styles.row}>
              <Text style={styles.label}>{stat.habitName}</Text>
              <Text style={styles.value}>{stat.streak} days</Text>
            </View>
          ))}
        </View>

        {/* Targets */}
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

// Week 4: UI consistency, spacing system, hierarchy
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
    marginTop: 2,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colours.accentBlue,
  },
  periodButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#fff',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#1F2937',
  },
  value: {
    fontWeight: '700',
    color: colours.accentBlue,
  },
  targetItem: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colours.accentBlue,
  },
  subText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
  },
});