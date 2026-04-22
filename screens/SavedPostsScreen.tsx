import React, { useMemo, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../components/layout/Screen';
import { Card } from '../components/ui/Card';
import { useSavedPosts } from '../context/SavedPostsContext';
import { useDebounce } from '../hooks/useDebounce';
import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { SavedPost } from '../services/firebase/savedPosts';

export function SavedPostsScreen() {
  const { palette } = useTheme();
  const { savedPosts, toggleSavedPost, isSyncing } = useSavedPosts();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 350);

  const filtered = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    if (!needle) {
      return savedPosts;
    }
    return savedPosts.filter((item) => {
      return item.title.toLowerCase().includes(needle) || item.body.toLowerCase().includes(needle);
    });
  }, [savedPosts, debouncedSearch]);

  const renderItem: ListRenderItem<SavedPost> = ({ item }) => (
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
  );

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Text style={[styles.heading, { color: palette.text }]}>Saved Posts</Text>
        <Text style={[styles.meta, { color: palette.mutedText }]}>
          {isSyncing ? 'Syncing with cloud...' : `${savedPosts.length} posts saved`}
        </Text>

        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search saved posts..."
          placeholderTextColor={palette.mutedText}
          style={[
            styles.search,
            {
              borderColor: palette.border,
              backgroundColor: palette.card,
              color: palette.text,
            },
          ]}
        />

        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: palette.mutedText }]}>No saved posts found.</Text>
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
  },
  meta: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
