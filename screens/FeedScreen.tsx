import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Card } from '../components/ui/Card';
import { SkeletonCard } from '../components/feedback/SkeletonCard';
import { Screen } from '../components/layout/Screen';
import { useDebounce } from '../hooks/useDebounce';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { fetchRemotePosts, RemotePost } from '../services/api/posts';
import { getItem, setItem, storageKeys } from '../services/storage/local';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../constants/theme';
import { showToast } from '../components/ToastProvider';
import { useSavedPosts } from '../context/SavedPostsContext';

import { Search } from 'lucide-react-native';

type FeedState = {
  items: RemotePost[];
  page: number;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string;
};

const PAGE_SIZE = 10;

export function FeedScreen() {
  const { palette } = useTheme();
  const { isSaved, toggleSavedPost } = useSavedPosts();
  const isOnline = useNetworkStatus();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 450);
  const [state, setState] = useState<FeedState>({
    items: [],
    page: 1,
    loading: true,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    error: '',
  });

  const loadInitial = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      if (!isOnline) {
        const cached = await getItem<RemotePost[]>(storageKeys.cachedFeed);
        setState((prev) => ({
          ...prev,
          items: cached ?? [],
          page: 1,
          hasMore: (cached?.length ?? 0) >= PAGE_SIZE,
          loading: false,
        }));
        return;
      }

      const items = await fetchRemotePosts(1, PAGE_SIZE, debouncedSearch);
      setState((prev) => ({
        ...prev,
        items,
        page: 1,
        hasMore: items.length === PAGE_SIZE,
        loading: false,
      }));
      await setItem(storageKeys.cachedFeed, items);
    } catch (error) {
      const cached = await getItem<RemotePost[]>(storageKeys.cachedFeed);
      setState((prev) => ({
        ...prev,
        items: cached ?? [],
        loading: false,
        error: (error as Error).message,
      }));
    }
  }, [debouncedSearch, isOnline]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const onRefresh = useCallback(async () => {
    setState((prev) => ({ ...prev, refreshing: true }));
    await loadInitial();
    setState((prev) => ({ ...prev, refreshing: false }));
  }, [loadInitial]);

  const onEndReached = useCallback(async () => {
    if (state.loadingMore || state.loading || !state.hasMore || !isOnline) {
      return;
    }

    setState((prev) => ({ ...prev, loadingMore: true }));
    try {
      const nextPage = state.page + 1;
      const nextItems = await fetchRemotePosts(nextPage, PAGE_SIZE, debouncedSearch);
      setState((prev) => ({
        ...prev,
        page: nextPage,
        items: [...prev.items, ...nextItems],
        hasMore: nextItems.length === PAGE_SIZE,
        loadingMore: false,
      }));
    } catch (error) {
      showToast('error', 'Pagination error', (error as Error).message);
      setState((prev) => ({ ...prev, loadingMore: false }));
    }
  }, [state.loadingMore, state.loading, state.hasMore, state.page, isOnline, debouncedSearch]);

  const data = useMemo(() => state.items, [state.items]);

  const renderItem: ListRenderItem<RemotePost> = useCallback(
    ({ item }) => (
      <Card
        title={item.title}
        description={item.body}
        isSaved={isSaved(item.id)}
        actionLabel={isSaved(item.id) ? 'Unsave' : 'Save'}
        onActionPress={() => void toggleSavedPost(item)}
        onPress={() =>
          router.push({
            pathname: '/(app)/post/[id]',
            params: {
              id: String(item.id),
              title: item.title,
              body: item.body,
            },
          })
        }
      />
    ),
    [isSaved, toggleSavedPost]
  );

  const keyExtractor = useCallback((item: RemotePost) => String(item.id), []);

  const getItemLayout = useCallback(
    (_: ArrayLike<RemotePost> | null | undefined, index: number) => ({
      length: 128,
      offset: 128 * index,
      index,
    }),
    []
  );

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: palette.text }]}>Community</Text>
          <View style={[styles.searchWrapper, { backgroundColor: palette.skeletonHighlight, borderColor: palette.border }]}>
            <Search size={18} color={palette.mutedText} style={styles.searchIcon} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search posts..."
              placeholderTextColor={palette.mutedText}
              style={[
                styles.search,
                { color: palette.text },
              ]}
            />
          </View>
        </View>

        {!isOnline && (
          <Text style={[styles.offlineBanner, { color: palette.warning }]}>Offline mode: reading cached data</Text>
        )}

        {state.loading ? (
          <View>
            {Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonCard key={`skeleton-${idx}`} />
            ))}
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            getItemLayout={getItemLayout}
            removeClippedSubviews
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            refreshControl={<RefreshControl refreshing={state.refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: palette.mutedText }]}>No items matched your search.</Text>
            }
            ListFooterComponent={
              state.loadingMore ? <Text style={[styles.loadingMore, { color: palette.mutedText }]}>Loading more...</Text> : null
            }
          />
        )}

        {!!state.error && <Text style={[styles.error, { color: palette.danger }]}>{state.error}</Text>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  search: {
    flex: 1,
    fontSize: 16,
  },
  offlineBanner: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  loadingMore: {
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  error: {
    marginTop: spacing.md,
    fontSize: 13,
  },
});
