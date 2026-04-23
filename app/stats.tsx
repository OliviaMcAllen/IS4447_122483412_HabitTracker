// Based on Week 8-9 tutorials - Statistics and insights screen with data visualisation
// Demonstrates aggregating data from database and rendering charts
import { useContext, useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
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

  const loadStatistics = async () => {
    try {
      // Get all habits
      const allHabits = await db.select().from(habitsTable);

      // Calculate stats for each habit
      const stats = await Promise.all(
        allHabits.map(async (habit: any) => {
          // Get all logs for this habit
          const logs = await db.select().from(habitLogs);
          const habitLogsFiltered = logs.filter((log: any) => log.habitId === habit.id);

          // Calculate week stats (last 7 days)
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - 7);
          const weekLogsCount = habitLogsFiltered.filter((log: any) => {
            const logDate = new Date(log.date);
            return logDate >= weekStart;
          }).length;

          // Calculate month stats (last 30 days)
          const monthStart = new Date();
          monthStart.setDate(monthStart.getDate() - 30);
          const monthLogsCount = habitLogsFiltered.filter((log: any) => {
            const logDate = new Date(log.date);
            return logDate >= monthStart;
          }).length;

          // Calculate streak (consecutive days with log)
          let streak = 0;
          const today = new Date();
          for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];

            const hasLog = habitLogsFiltered.some((log: any) => log.date === dateStr);
            if (hasLog) {
              streak++;
            } else if (i > 0) {
              break;
            }
          }

          return {
            habitName: habit.name,
            totalLogsThisWeek: weekLogsCount,
            totalLogsThisMonth: monthLogsCount,
            streak,
          };
        })
      );

      setHabitStats(stats);

      // Load target progress
      const allTargets = await db.select().from(targetsTable);
      const progress = await Promise.all(
        allTargets.map(async (target: any) => {
          const habit = allHabits.find((h: any) => h.id === target.habitId);
          const logs = await db.select().from(habitLogs);
          const habitLogsFiltered = logs.filter((log: any) => log.habitId === target.habitId);

          let relevantLogs = habitLogsFiltered;

          if (target.period === 'weekly') {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - 7);
            relevantLogs = habitLogsFiltered.filter((log: any) => {
              const logDate = new Date(log.date);
              return logDate >= weekStart;
            });
          } else if (target.period === 'daily') {
            const today = new Date().toISOString().split('T')[0];
            relevantLogs = habitLogsFiltered.filter((log: any) => log.date === today);
          } else {
            const monthStart = new Date();
            monthStart.setDate(monthStart.getDate() - 30);
            relevantLogs = habitLogsFiltered.filter((log: any) => {
              const logDate = new Date(log.date);
              return logDate >= monthStart;
            });
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
        })
      );

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📊 Statistics</Text>

        {/* Period selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            onPress={() => setSelectedPeriod('week')}
            style={[
              styles.periodButton,
              selectedPeriod === 'week' && styles.periodButtonActive,
            ]}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'week' && styles.periodButtonTextActive,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedPeriod('month')}
            style={[
              styles.periodButton,
              selectedPeriod === 'month' && styles.periodButtonActive,
            ]}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'month' && styles.periodButtonTextActive,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Habit completion chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habit Completion</Text>

          {habitStats.length === 0 ? (
            <Text style={styles.emptyText}>No habit data yet</Text>
          ) : (
            habitStats.map((stat, index) => {
              const value =
                selectedPeriod === 'week' ? stat.totalLogsThisWeek : stat.totalLogsThisMonth;
              const maxValue =
                selectedPeriod === 'week' ? Math.max(...habitStats.map((s) => s.totalLogsThisWeek), 1) : Math.max(...habitStats.map((s) => s.totalLogsThisMonth), 1);
              const barWidth = (value / maxValue) * 100;

              return (
                <View key={index} style={styles.chartItem}>
                  <View style={styles.chartLabel}>
                    <Text style={styles.chartLabelText}>{stat.habitName}</Text>
                    <Text style={styles.chartValue}>{value}</Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${barWidth}%`,
                          backgroundColor: '#6366f1',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Streaks section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Streaks</Text>

          {habitStats.length === 0 ? (
            <Text style={styles.emptyText}>No streaks yet</Text>
          ) : (
            habitStats.map((stat, index) => (
              <View key={index} style={styles.streakCard}>
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
            targetProgress.map((target, index) => (
              <View key={index} style={styles.targetCard}>
                <View style={styles.targetHeader}>
                  <Text style={styles.targetName}>{target.habitName}</Text>
                  <Text style={styles.targetPeriod}>{target.period}</Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${target.percentage}%`,
                          backgroundColor:
                            target.percentage >= 100 ? '#10b981' : '#f59e0b',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {target.currentValue} / {target.targetValue}
                  </Text>
                </View>

                {target.percentage >= 100 ? (
                  <Text style={styles.targetMet}>✓ Target met!</Text>
                ) : (
                  <Text style={styles.targetNotMet}>
                    {Math.ceil(target.targetValue - target.currentValue)} remaining
                  </Text>
                )}
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
    color: '#1f2937',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#6366f1',
  },
  periodButtonText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#666',
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
    color: '#1f2937',
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
    color: '#333',
  },
  chartValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366f1',
  },
  barContainer: {
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  streakCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  streakHabitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  targetCard: {
    backgroundColor: '#fff',
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
    color: '#1f2937',
  },
  targetPeriod: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  targetMet: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  targetNotMet: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    paddingVertical: 20,
  },
});