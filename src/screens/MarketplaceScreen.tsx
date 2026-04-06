import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {v4 as uuidv4} from 'uuid';
import {MARKETPLACE_LISTINGS} from '../data/sampleData';
import type {Routine, SharedRoutine} from '../types/models';
import {
  getRoutines,
  saveExercises,
  saveRoutine,
} from '../storage/database';
import {CATEGORY_COLOR, CATEGORY_EMOJI} from '../types/models';

export function MarketplaceScreen(): React.JSX.Element {
  const [listings, setListings] = useState<SharedRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Simulate async fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setListings(MARKETPLACE_LISTINGS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    if (!searchText.trim()) {
      return listings;
    }
    const q = searchText.toLowerCase();
    return listings.filter(
      l =>
        l.name.toLowerCase().includes(q) ||
        l.authorName.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q),
    );
  }, [listings, searchText]);

  const handleImport = useCallback(
    async (shared: SharedRoutine) => {
      // Deduplicate by shareId
      const existing = await getRoutines();
      if (existing.some(r => r.shareId === shared.id)) {
        setImportedIds(prev => new Set([...prev, shared.id]));
        return;
      }

      const routineId = uuidv4();
      const routine: Routine = {
        id: routineId,
        name: shared.name,
        category: shared.category,
        variant: shared.variant,
        isCustom: true,
        authorName: shared.authorName,
        shareId: shared.id,
      };
      await saveRoutine(routine);
      await saveExercises(
        shared.exercises.map((ex, idx) => ({
          id: uuidv4(),
          routineId,
          name: ex.name,
          targetMuscleGroup: ex.targetMuscleGroup,
          defaultSets: ex.defaultSets,
          defaultReps: ex.defaultReps,
          order: idx,
          restDurationSeconds: 0,
        })),
      );
      setImportedIds(prev => new Set([...prev, shared.id]));
      Alert.alert('Imported!', `"${shared.name}" is now in your routine list.`);
    },
    [],
  );

  const handlePublish = useCallback(
    (published: SharedRoutine) => {
      setListings(prev => [published, ...prev]);
      setShowPublishModal(false);
    },
    [],
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#F97316" size="large" />
        <Text style={styles.loadingText}>Loading community routines…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search routines…"
          placeholderTextColor="#4B5563"
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.publishBtn}
          onPress={() => setShowPublishModal(true)}>
          <Text style={styles.publishBtnText}>↑ Share</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.title}>Marketplace</Text>}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>
              {searchText ? 'No results' : 'No routines yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchText
                ? 'Try a different search term.'
                : 'Be the first to publish a routine!'}
            </Text>
          </View>
        }
        renderItem={({item}) => (
          <MarketplaceCard
            routine={item}
            isImported={importedIds.has(item.id)}
            onImport={() => handleImport(item)}
          />
        )}
      />

      <Modal
        visible={showPublishModal}
        animationType="slide"
        onRequestClose={() => setShowPublishModal(false)}>
        <PublishModal
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
        />
      </Modal>
    </View>
  );
}

// ─── Marketplace card ─────────────────────────────────────────────────────────

function MarketplaceCard({
  routine,
  isImported,
  onImport,
}: {
  routine: SharedRoutine;
  isImported: boolean;
  onImport: () => void;
}): React.JSX.Element {
  const color = CATEGORY_COLOR[routine.category];
  return (
    <View style={styles.card}>
      <View style={[styles.categoryIcon, {backgroundColor: color + '22'}]}>
        <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[routine.category]}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{routine.name}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.catPill, {backgroundColor: color + '22'}]}>
            <Text style={[styles.catPillText, {color}]}>{routine.category}</Text>
          </View>
          <Text style={styles.cardAuthor}>by {routine.authorName}</Text>
        </View>
        <Text style={styles.cardStats}>
          {routine.exercises.length} exercises · {routine.downloadCount} downloads
        </Text>
      </View>
      <TouchableOpacity
        onPress={onImport}
        disabled={isImported}
        style={styles.importBtn}>
        <Text style={[styles.importBtnText, isImported && styles.importBtnDone]}>
          {isImported ? '✓' : '⬇'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Publish modal ────────────────────────────────────────────────────────────

function PublishModal({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (r: SharedRoutine) => void;
}): React.JSX.Element {
  const [myRoutines, setMyRoutines] = useState<Routine[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    getRoutines().then(setMyRoutines);
  }, []);

  const canPublish =
    selectedId !== null && authorName.trim().length > 0;

  const handlePublish = useCallback(async () => {
    const routine = myRoutines.find(r => r.id === selectedId);
    if (!routine) {
      return;
    }
    const shared: SharedRoutine = {
      id: uuidv4(),
      name: routine.name,
      category: routine.category,
      variant: routine.variant,
      authorName: authorName.trim(),
      publishedAt: new Date().toISOString(),
      downloadCount: 0,
      exercises: [],
    };
    setPublished(true);
    setTimeout(() => {
      onPublish(shared);
    }, 1200);
  }, [selectedId, authorName, myRoutines, onPublish]);

  return (
    <View style={modal.container}>
      <View style={modal.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={modal.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={modal.headerTitle}>Publish Routine</Text>
        <TouchableOpacity onPress={handlePublish} disabled={!canPublish}>
          <Text style={[modal.publish, !canPublish && modal.publishDisabled]}>
            Publish
          </Text>
        </TouchableOpacity>
      </View>

      {published ? (
        <View style={modal.successContainer}>
          <Text style={modal.successEmoji}>🎉</Text>
          <Text style={modal.successText}>Published successfully!</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={modal.content}>
          <Text style={modal.label}>Your Name</Text>
          <TextInput
            style={modal.input}
            value={authorName}
            onChangeText={setAuthorName}
            placeholder="Display name"
            placeholderTextColor="#4B5563"
          />

          <Text style={modal.label}>Choose Routine</Text>
          {myRoutines.map(r => (
            <TouchableOpacity
              key={r.id}
              style={[
                modal.routineRow,
                selectedId === r.id && modal.routineRowSelected,
              ]}
              onPress={() => setSelectedId(r.id)}>
              <Text style={modal.routineRowText}>{r.name}</Text>
              {selectedId === r.id && (
                <Text style={modal.routineRowCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000000'},
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {color: '#6B7280', marginTop: 12, fontSize: 14},
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  publishBtn: {
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  publishBtnText: {color: '#000000', fontWeight: '700', fontSize: 13},
  listContent: {paddingHorizontal: 16, paddingBottom: 24},
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 16,
  },
  emptyContainer: {alignItems: 'center', paddingTop: 60},
  emptyEmoji: {fontSize: 48, marginBottom: 12},
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {fontSize: 22},
  cardBody: {flex: 1},
  cardTitle: {color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 4},
  cardMeta: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4},
  catPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  catPillText: {fontSize: 11, fontWeight: '700'},
  cardAuthor: {color: '#6B7280', fontSize: 12},
  cardStats: {color: '#4B5563', fontSize: 11},
  importBtn: {padding: 8},
  importBtnText: {fontSize: 22, color: '#F97316'},
  importBtnDone: {color: '#22C55E'},
});

const modal = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000000'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerTitle: {color: '#FFFFFF', fontSize: 17, fontWeight: '600'},
  cancel: {color: '#6B7280', fontSize: 16},
  publish: {color: '#F97316', fontSize: 16, fontWeight: '600'},
  publishDisabled: {opacity: 0.4},
  content: {padding: 16},
  label: {
    color: '#6B7280',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  routineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  routineRowSelected: {
    borderWidth: 1,
    borderColor: '#F97316',
  },
  routineRowText: {color: '#FFFFFF', fontSize: 15},
  routineRowCheck: {color: '#F97316', fontSize: 18},
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successEmoji: {fontSize: 60, marginBottom: 16},
  successText: {color: '#22C55E', fontSize: 20, fontWeight: '600'},
});
