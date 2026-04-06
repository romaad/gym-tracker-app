import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getSessions, getSetLogs} from '../storage/database';
import type {WorkoutSession} from '../types/models';

interface SessionWithStats extends WorkoutSession {
  setCount: number;
  durationMinutes: number;
}

export function HistoryScreen(): React.JSX.Element {
  const [sessions, setSessions] = useState<SessionWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await getSessions();
    // Only show completed sessions
    const completed = all.filter(s => !!s.endDate);
    const withStats: SessionWithStats[] = await Promise.all(
      completed.map(async s => {
        const logs = await getSetLogs(s.id);
        const durationMs =
          new Date(s.endDate!).getTime() - new Date(s.startDate).getTime();
        return {
          ...s,
          setCount: logs.length,
          durationMinutes: Math.round(durationMs / 60_000),
        };
      }),
    );
    // Sort newest first
    withStats.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
    setSessions(withStats);
    setLoading(false);
  }, []);

  // Reload whenever the tab becomes focused
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#F97316" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={s => s.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.title}>History</Text>}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete a session to see your history here.
            </Text>
          </View>
        }
        renderItem={({item}) => <SessionCard session={item} />}
      />
    </View>
  );
}

function SessionCard({session}: {session: SessionWithStats}): React.JSX.Element {
  const startDate = new Date(session.startDate);
  const dateStr = startDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = startDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.routineName}>{session.routineName}</Text>
        <Text style={styles.dateTime}>
          {dateStr}  ·  {timeStr}
        </Text>
        <Text style={styles.stats}>
          {session.durationMinutes} min  ·  {session.setCount} sets
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  routineName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateTime: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 4,
  },
  stats: {
    color: '#4B5563',
    fontSize: 12,
  },
});
