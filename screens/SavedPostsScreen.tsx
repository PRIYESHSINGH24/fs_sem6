import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Search, Bookmark as BookmarkIcon, Inbox } from 'lucide-react-native';
import { Screen } from '../components/layout/Screen';
import { Card } from '../components/ui/Card';
import { useSavedPosts } from '../context/SavedPostsContext';
import { useDebounce } from '../hooks/useDebounce';
import { spacing, radius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { SavedPost } from '../services/firebase/savedPosts';

export function SavedPostsScreen() {
  const { palette } = useTheme();
  const { savedPosts, toggleSavedPost, isSyncing } = useSavedPosts();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 350);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const filtered = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    if (!needle) {
      return savedPosts;
    }
    return savedPosts.filter((item) => {
      return item.title.toLowerCase().includes(needle) || item.body.toLowerCase().includes(needle);
    });
  }, [savedPosts, debouncedSearch]);

  const renderItem: ListRenderItem<SavedPost> = useCallback(
    ({ item }) => (
      <Card
        title={item.title}
        description={item.body}
        isSaved={true}
        actionLabel="Unsave"
        onActionPress={() => toggleSavedPost(item)}
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
    [toggleSavedPost]
  );

  const keyExtractor = useCallback((item: SavedPost) => String(item.id), []);

  return (
    <Screen>
      <Animated.View
        style={[styles.container, { backgroundColor: palette.background, opacity: fadeAnim }]}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={[styles.iconCircle, { backgroundColor: palette.primary + '18' }]}>
            <BookmarkIcon size={24} color={palette.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.heading, { color: palette.text }]}>Saved Posts</Text>
            <Text style={[styles.meta, { color: palette.mutedText }]}>
              {isSyncing ? 'Syncing with cloud...' : `${savedPosts.length} posts saved`}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchWrapper,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Search size={18} color={palette.mutedText} style={{ marginRight: spacing.sm }} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search saved posts..."
            placeholderTextColor={palette.mutedText}
            style={[styles.search, { color: palette.text }]}
          />
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Inbox size={48} color={palette.mutedText} style={{ opacity: 0.4 }} />
              <Text style={[styles.emptyTitle, { color: palette.text }]}>
                {searchText ? 'No results' : 'No saved posts yet'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: palette.mutedText }]}>
                {searchText
                  ? 'Try a different search term'
                  : 'Tap the bookmark icon on any post to save it'}
              </Text>
              {!searchText && (
                <Pressable
                  onPress={() => router.navigate('/(app)/(drawer)/feed')}
                  style={[styles.emptyCta, { backgroundColor: palette.primary }]}
                >
                  <Text style={styles.emptyCtaText}>Browse Feed</Text>
                </Pressable>
              )}
            </View>
          }
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  search: {
    flex: 1,
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
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
});
