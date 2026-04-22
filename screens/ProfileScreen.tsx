import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Animated,
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  User as UserIcon,
  Mail,
  Calendar,
  FileText,
  Bookmark,
  Trash2,
  Inbox,
} from 'lucide-react-native';
import { Screen } from '../components/layout/Screen';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useUserPosts } from '../context/UserPostsContext';
import { useSavedPosts } from '../context/SavedPostsContext';
import { UserPost } from '../services/firebase/userPosts';
import { spacing, radius } from '../constants/theme';

const getAvatarURL = (name: string) =>
  `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(name)}&backgroundColor=2563EB&textColor=ffffff&fontSize=40`;

export function ProfileScreen() {
  const { palette } = useTheme();
  const { user } = useAuth();
  const { userPosts, removePost } = useUserPosts();
  const { savedPosts } = useSavedPosts();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const myPosts = useMemo(
    () => userPosts.filter((p) => p.authorId === user?.uid),
    [userPosts, user?.uid]
  );

  const displayName = user?.displayName || 'User';
  const joinDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  const handleDelete = useCallback(
    (postId: string) => {
      void removePost(postId);
    },
    [removePost]
  );

  const renderPostItem: ListRenderItem<UserPost> = useCallback(
    ({ item }) => (
      <View
        style={[
          styles.postCard,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
      >
        <View style={styles.postCardContent}>
          <View style={[styles.categoryChip, { backgroundColor: palette.primary + '15' }]}>
            <Text style={[styles.categoryChipText, { color: palette.primary }]}>{item.category}</Text>
          </View>
          <Text style={[styles.postTitle, { color: palette.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.postBody, { color: palette.mutedText }]} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        <Pressable
          onPress={() => handleDelete(item.id)}
          hitSlop={12}
          style={[styles.deleteBtn, { backgroundColor: palette.danger + '12' }]}
        >
          <Trash2 size={16} color={palette.danger} />
        </Pressable>
      </View>
    ),
    [palette, handleDelete]
  );

  const keyExtractor = useCallback((item: UserPost) => item.id, []);

  return (
    <Screen>
      <Animated.View style={[styles.screen, { opacity: fadeAnim, backgroundColor: palette.background }]}>
        <FlatList
          data={myPosts}
          renderItem={renderPostItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              {/* Profile Header Card */}
              <View
                style={[
                  styles.profileCard,
                  { backgroundColor: palette.card, borderColor: palette.border },
                ]}
              >
                <View style={styles.profileTop}>
                  <Image
                    source={{ uri: getAvatarURL(displayName) }}
                    style={styles.avatar}
                  />
                  <View style={styles.profileInfo}>
                    <Text style={[styles.displayName, { color: palette.text }]}>
                      {displayName}
                    </Text>
                    <View style={styles.infoRow}>
                      <Mail size={13} color={palette.mutedText} />
                      <Text style={[styles.infoText, { color: palette.mutedText }]}>
                        {user?.email || 'No email'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Calendar size={13} color={palette.mutedText} />
                      <Text style={[styles.infoText, { color: palette.mutedText }]}>
                        Joined {joinDate}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Stats */}
                <View style={[styles.statsContainer, { borderTopColor: palette.border }]}>
                  <View style={styles.statItem}>
                    <FileText size={18} color={palette.primary} />
                    <Text style={[styles.statNumber, { color: palette.text }]}>
                      {myPosts.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: palette.mutedText }]}>Posts</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: palette.border }]} />
                  <View style={styles.statItem}>
                    <Bookmark size={18} color={palette.primary} />
                    <Text style={[styles.statNumber, { color: palette.text }]}>
                      {savedPosts.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: palette.mutedText }]}>Saved</Text>
                  </View>
                </View>
              </View>

              {/* Section Header */}
              <Text style={[styles.sectionTitle, { color: palette.text }]}>My Posts</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Inbox size={44} color={palette.mutedText} style={{ opacity: 0.4 }} />
              <Text style={[styles.emptyTitle, { color: palette.mutedText }]}>
                No posts yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: palette.mutedText }]}>
                Your published posts will appear here
              </Text>
              <Pressable
                onPress={() => router.navigate('/(app)/(drawer)/create')}
                style={[styles.emptyCta, { backgroundColor: palette.primary }]}
              >
                <Text style={styles.emptyCtaText}>Create your first post</Text>
              </Pressable>
            </View>
          }
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  profileTop: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eee',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  postCardContent: {
    flex: 1,
    gap: 4,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 2,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  postBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
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
