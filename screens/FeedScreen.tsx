import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  ListRenderItem,
  Pressable,
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
import { useUserPosts } from '../context/UserPostsContext';
import { spacing, radius } from '../constants/theme';
import { showToast } from '../components/ToastProvider';
import { useSavedPosts } from '../context/SavedPostsContext';

import { Search, Inbox, WifiOff, RefreshCw } from 'lucide-react-native';
import { Button } from '../components/ui/Button';

type FeedState = {
  items: RemotePost[];
  page: number;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string;
};

type FeedItem = {
  key: string;
  type: 'user' | 'remote';
  id: number | string;
  title: string;
  body: string;
  category?: string;
  authorName?: string;
};

const PAGE_SIZE = 10;

export function FeedScreen() {
  const { palette } = useTheme();
  const { isSaved, toggleSavedPost } = useSavedPosts();
  const { userPosts } = useUserPosts();
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

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

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

  // Merge user posts from Firestore with remote API posts
  const mergedData = useMemo((): FeedItem[] => {
    const needle = debouncedSearch.trim().toLowerCase();

    const userItems: FeedItem[] = userPosts
      .filter((p) => {
        if (!needle) return true;
        return p.title.toLowerCase().includes(needle) || p.body.toLowerCase().includes(needle);
      })
      .map((p) => ({
        key: `user-${p.id}`,
        type: 'user' as const,
        id: p.id,
        title: p.title,
        body: p.body,
        category: p.category,
        authorName: p.authorName,
      }));

    const remoteItems: FeedItem[] = state.items.map((p) => ({
      key: `remote-${p.id}`,
      type: 'remote' as const,
      id: p.id,
      title: p.title,
      body: p.body,
    }));

    return [...userItems, ...remoteItems];
  }, [userPosts, state.items, debouncedSearch]);

  const renderItem: ListRenderItem<FeedItem> = useCallback(
    ({ item }) => (
      <Card
        title={item.title}
        description={item.body}
        category={item.type === 'user' ? item.category : undefined}
        authorName={item.type === 'user' ? item.authorName : undefined}
        isSaved={item.type === 'remote' ? isSaved(item.id as number) : false}
        actionLabel={
          item.type === 'remote'
            ? isSaved(item.id as number)
              ? 'Unsave'
              : 'Save'
            : undefined
        }
        onActionPress={
          item.type === 'remote'
            ? () =>
                void toggleSavedPost({
                  id: item.id as number,
                  title: item.title,
                  body: item.body,
                })
            : undefined
        }
        onPress={
          item.type === 'remote'
            ? () =>
                router.push({
                  pathname: '/(app)/post/[id]',
                  params: {
                    id: String(item.id),
                    title: item.title,
                    body: item.body,
                  },
                })
            : undefined
        }
      />
    ),
    [isSaved, toggleSavedPost]
  );

  const keyExtractor = useCallback((item: FeedItem) => item.key, []);

  return (
    <Screen>
      <Animated.View style={[styles.container, { backgroundColor: palette.background, opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.heading, { color: palette.text }]}>Community</Text>
          <Text style={[styles.subheading, { color: palette.mutedText }]}>
            Discover and share ideas
          </Text>
          <View
            style={[
              styles.searchWrapper,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <Search size={18} color={palette.mutedText} style={styles.searchIcon} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search posts..."
              placeholderTextColor={palette.mutedText}
              style={[styles.search, { color: palette.text }]}
            />
          </View>
        </View>

        {/* Offline Banner */}
        {!isOnline && (
          <View style={[styles.offlineBanner, { backgroundColor: palette.warning + '18' }]}>
            <WifiOff size={16} color={palette.warning} />
            <Text style={[styles.offlineText, { color: palette.warning }]}>
              Offline — showing cached data
            </Text>
          </View>
        )}

        {/* Error Banner */}
        {!!state.error && (
          <View style={[styles.errorBanner, { backgroundColor: palette.danger + '12' }]}>
            <Text style={[styles.errorText, { color: palette.danger }]}>{state.error}</Text>
            <Pressable onPress={() => void loadInitial()}>
              <RefreshCw size={16} color={palette.danger} />
            </Pressable>
          </View>
        )}

        {/* Content */}
        {state.loading ? (
          <View>
            {Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonCard key={`skeleton-${idx}`} />
            ))}
          </View>
        ) : (
          <FlatList
            data={mergedData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            removeClippedSubviews
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            refreshControl={
              <RefreshControl refreshing={state.refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Inbox size={48} color={palette.mutedText} style={styles.emptyIcon} />
                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  {searchText ? 'No results found' : 'No posts yet'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: palette.mutedText }]}>
                  {searchText
                    ? 'Try a different search term'
                    : 'Be the first to share something!'}
                </Text>
                {!searchText && (
                  <Pressable
                    onPress={() => router.navigate('/(app)/(drawer)/create')}
                    style={[styles.emptyCta, { backgroundColor: palette.primary }]}
                  >
                    <Text style={styles.emptyCtaText}>Create Post</Text>
                  </Pressable>
                )}
              </View>
            }
            ListFooterComponent={
              state.loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <View style={[styles.loadingMorePill, { backgroundColor: palette.card, borderColor: palette.border }]}>
                    <Text style={[styles.loadingMoreText, { color: palette.mutedText }]}>
                      Loading more...
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}
      </Animated.View>
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
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 2,
    marginTop: spacing.xs,
  },
  subheading: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  search: {
    flex: 1,
    fontSize: 15,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  offlineText: {
    fontWeight: '600',
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    fontWeight: '500',
    fontSize: 13,
    marginRight: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxxl,
    padding: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 14,
  },
  emptyCta: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  emptyCtaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingMoreContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  loadingMorePill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  loadingMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
