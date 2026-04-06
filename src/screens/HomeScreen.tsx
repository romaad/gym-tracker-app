import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../navigation/AppNavigator';
import type {Routine} from '../types/models';
import {getRoutines, seedIfNeeded} from '../storage/database';
import {CATEGORY_COLOR, CATEGORY_EMOJI} from '../types/models';
import {healthKitService} from '../services/healthKitService';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineList'>;

export function HomeScreen({navigation}: Props): React.JSX.Element {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    await seedIfNeeded();
    const all = await getRoutines();
    setRoutines(all);
    setLoading(false);
    healthKitService.requestAuthorization();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groupedRoutines: Record<string, Routine[]> = {};
  for (const r of routines) {
    if (!groupedRoutines[r.category]) {
      groupedRoutines[r.category] = [];
    }
    groupedRoutines[r.category].push(r);
  }
  const categories = ['Push', 'Pull', 'Legs'] as const;

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
        data={categories}
        keyExtractor={cat => cat}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.subtitle}>Choose today's split</Text>
        }
        renderItem={({item: cat}) => (
          <View key={cat} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {CATEGORY_EMOJI[cat]}  {cat}
            </Text>
            {(groupedRoutines[cat] ?? []).map(routine => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onPress={() => navigation.navigate('WorkoutSession', {routine})}
              />
            ))}
          </View>
        )}
      />
    </View>
  );
}

// ─── Routine card ─────────────────────────────────────────────────────────────

function RoutineCard({
  routine,
  onPress,
}: {
  routine: Routine;
  onPress: () => void;
}): React.JSX.Element {
  const color = CATEGORY_COLOR[routine.category];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.cardAccent, {backgroundColor: color}]} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{routine.name}</Text>
        {routine.authorName && (
          <Text style={styles.cardAuthor}>by {routine.authorName}</Text>
        )}
      </View>
      <Text style={styles.cardChevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardAuthor: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  cardChevron: {
    color: '#4B5563',
    fontSize: 24,
    paddingRight: 14,
  },
});
