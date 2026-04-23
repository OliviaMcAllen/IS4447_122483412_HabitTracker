// Based on Week 8-9 tutorials - Statistics and insights screen with data visualisation
// Demonstrates aggregating data from database and rendering charts
// Week 3 tutorial: useState/useEffect hooks for state management
// Week 11 tutorial: Drizzle ORM for database queries and data aggregation

import { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colours } from '../constants/colours';
import { db } from '../db/client';
import { habitLogs, habits as habitsTable, targets as targetsTable } from '../db/schema';
import { AuthContext } from './_layout';

type HabitStat = {
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

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  // Helper function to calculate date range
  const getDateRange = (days: number) => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    return start;
  };

  // Helper function to calculate streak for a habit
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

  // Load habit statistics and target progress from database
  const loadStatistics = async () => {
    try {
      const allHabits = await db.select().from(habitsTable);
      const allLogs = await db.select().from(habitLogs);

      // Calculate habit statistics
      const stats = allHabits.map((habit: any) => {
        const habitLogsFiltered = allLogs.filter((log: any) => log.habitId === habit.id);
        const weekStart = getDateRange(7);
        const monthStart = getDateRange(30);

        return {
          habitName: habit.name,
          totalLogsThisWeek: habitLogsFiltered.filter((log: any) => 
            new Date(log.date) >= weekStart
          ).length,
          totalLogsThisMonth: habitLogsFiltered.filter((log: any) => 
            new Date(log.date) >= monthStart
          ).length,
          streak: calculateStreak(habitLogsFiltered),
        };
      });

      setHabitStats(stats);

      // Calculate target progress
      const allTargets = await db.select().from(targetsTable);
      const progress = allTargets.map((target: any) => {
        const habit = allHabits.find((h: any) => h.id === target.habitId);
        const habitLogsFiltered = allLogs.filter((log: any) => log.habitId === target.habitId);

        let relevantLogs = habitLogsFiltered;
        if (target.period === 'weekly') {
          relevantLogs = habitLogsFiltered.filter((log: any) => 
            new Date(log.date) >= getDateRange(7)
          );
        } else if (target.period === 'daily') {
          const today = new Date().toISOString().split('T')[0];
          relevantLogs = habitLogsFiltered.filter((log: any) => log.date === today);
        } else {
          relevantLogs = habitLogsFiltered.filter((log: any) => 
            new Date(log.date) >= getDateRange(30)
          );
        }

        const currentValue = relevantLogs.reduce((sum, log: any) => sum + log.count, 0);
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
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Helper to render bar chart item
  const renderChartItem = (stat: HabitStat) => {
    const value = selectedPeriod === 'week' ? stat.totalLogsThisWeek : stat.totalLogsThisMonth;
    const maxValue = Math.max(
      ...(selectedPeriod === 'week' 
        ? habitStats.map((s) => s.totalLogsThisWeek)
        : habitStats.map((s) => s.totalLogsThisMonth)),
      1
    );
    const barWidth = (value / maxValue) * 100;

    return (
      <View key={stat.habitName} style={styles.chartItem}>
        <View style={styles.chartLabel}>
          <Text style={styles.chartLabelText}>{stat.habitName}</Text>
          <Text style={styles.chartValue}>{value}</Text>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${barWidth}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundLight }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Statistics</Text>

        {/* Period selector buttons */}
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
                {period === 'week' ? 'This Week' : 'This Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Habit completion chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habit Completion</Text>
          {habitStats.length === 0 ? (
            <Text style={styles.emptyText}>No habit data yet</Text>
          ) : (
            habitStats.map(renderChartItem)
          )}
        </View>

        {/* Streaks section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streaks</Text>
          {habitStats.length === 0 ? (
            <Text style={styles.emptyText}>No streaks yet</Text>
          ) : (
            habitStats.map((stat) => (
              <View key={stat.habitName} style={styles.streakCard}>
                <Text style={styles.streakHabitName}>{stat.habitName}</Text>
                <Text style={styles.streakValue}>{stat.streak} days</Text>
              </View>
            ))
          )}
        </View>

        {/* Target progress section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Progress</Text>
          {targetProgress.length === 0 ? (
            <Text style={styles.emptyText}>No targets set yet</Text>
          ) : (
            targetProgress.map((target) => (
              <View key={target.habitName} style={styles.targetCard}>
                <View style={styles.targetHeader}>
                  <Text style={styles.targetName}>{target.habitName}</Text>
                  <Text style={styles.targetPeriod}>{target.period}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${target.percentage}%`,
                        backgroundColor: target.percentage >= 100 ? colours.catHealth : colours.catProductivity,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressText}>
                  <Text style={styles.progressLabel}>{target.currentValue} / {target.targetValue}</Text>
                  <Text style={[styles.progressStatus, target.percentage >= 100 ? styles.targetMet : styles.targetNotMet]}>
                    {target.percentage >= 100 ? 'Target met!' : `${Math.ceil(target.targetValue - target.currentValue)} remaining`}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
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
    marginBottom: 20,
    color: colours.textPrimary,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: colours.backgroundDark,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colours.accentBlue,
  },
  periodButtonText: {
    fontWeight: '600',
    fontSize: 13,
    color: colours.textSecondary,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: colours.textPrimary,
  },
  chartItem: {
    marginBottom: 16,
  },
  chartLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  chartLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colours.textPrimary,
  },
  chartValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colours.accentBlue,
  },
  barContainer: {
    height: 24,
    backgroundColor: colours.backgroundDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colours.accentBlue,
    borderRadius: 4,
  },
  streakCard: {
    backgroundColor: colours.cardBg,
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colours.catFitness,
  },
  streakHabitName: {
    fontSize: 14,
    fontWeight: '600',
    color: colours.textPrimary,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colours.catFitness,
  },
  targetCard: {
    backgroundColor: colours.cardBg,
    padding: 16,
    marginBottom: 12,
    borderRadius: 6,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  targetName: {
    fontSize: 14,
    fontWeight: '700',
    color: colours.textPrimary,
  },
  targetPeriod: {
    fontSize: 12,
    fontWeight: '600',
    color: colours.textSecondary,
    textTransform: 'capitalize',
  },
  progressBar: {
    height: 8,
    backgroundColor: colours.backgroundDark,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    gap: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: colours.textSecondary,
    marginBottom: 4,
  },
  progressStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  targetMet: {
    color: colours.catHealth,
  },
  targetNotMet: {
    color: colours.catFitness,
  },
  emptyText: {
    textAlign: 'center',
    color: colours.textSecondary,
    fontSize: 13,
    paddingVertical: 20,
  },
});