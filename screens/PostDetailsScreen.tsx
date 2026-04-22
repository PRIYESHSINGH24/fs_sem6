import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Heart, MessageSquare, Repeat2, Bookmark, Share } from 'lucide-react-native';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { useTheme } from '../context/ThemeContext';
import { spacing, radius } from '../constants/theme';
import { fetchPostById } from '../services/api/posts';
import { showToast } from '../components/ToastProvider';

type PostState = {
  title: string;
  body: string;
  loading: boolean;
  error: string;
};

const getAvatarURL = (name: string) => `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

export function PostDetailsScreen() {
  const { palette } = useTheme();
  const params = useLocalSearchParams<{ id?: string; title?: string; body?: string }>();
  const [state, setState] = useState<PostState>({
    title: params.title ?? '',
    body: params.body ?? '',
    loading: true,
    error: '',
  });
  const [liked, setLiked] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  const id = Number(params.id ?? 0);

  const loadPost = useCallback(async () => {
    if (!id) {
      setState((prev) => ({ ...prev, loading: false, error: 'Invalid post ID.' }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const post = await fetchPostById(id);
      setState({
        title: post.title,
        body: post.body,
        loading: false,
        error: '',
      });
    } catch (error) {
      const message = (error as Error).message;
      setState((prev) => ({ ...prev, loading: false, error: message }));
      showToast('error', 'Details unavailable', message);
    }
  }, [id]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  useEffect(() => {
    if (!state.loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.loading]);

  if (state.loading) {
    return <Loader />;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: palette.background }]}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Author header */}
          <View style={styles.header}>
            <Image style={styles.avatar} source={{ uri: getAvatarURL(state.title) }} />
            <View style={styles.info}>
              <Text style={[styles.authorName, { color: palette.text }]} numberOfLines={1}>
                {state.title || 'Anonymous'}
              </Text>
              <Text style={[styles.username, { color: palette.mutedText }]}>
                @user_{state.title?.slice(0, 5).toLowerCase().replace(/\s/g, '') || 'anon'}
              </Text>
            </View>
          </View>

          {/* Post content */}
          <Text style={[styles.title, { color: palette.text }]}>{state.title || 'Untitled post'}</Text>
          <Text style={[styles.body, { color: palette.text }]}>{state.body || 'No body available.'}</Text>
          <Text style={[styles.timestamp, { color: palette.mutedText }]}>8:42 PM · Apr 22, 2026 · 14.5K Views</Text>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          {/* Stats */}
          <View style={styles.statsRow}>
            <Text style={[styles.statValue, { color: palette.text }]}>
              120 <Text style={[styles.statLabel, { color: palette.mutedText }]}>Reposts</Text>
            </Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              12 <Text style={[styles.statLabel, { color: palette.mutedText }]}>Quotes</Text>
            </Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              4,512 <Text style={[styles.statLabel, { color: palette.mutedText }]}>Likes</Text>
            </Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              82 <Text style={[styles.statLabel, { color: palette.mutedText }]}>Bookmarks</Text>
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable hitSlop={12}>
              <MessageSquare size={22} color={palette.mutedText} />
            </Pressable>
            <Pressable hitSlop={12}>
              <Repeat2 size={22} color={palette.mutedText} />
            </Pressable>
            <Pressable
              hitSlop={12}
              onPress={() => {
                setLiked((prev) => !prev);
                showToast('success', liked ? 'Unliked' : 'Liked!', '');
              }}
            >
              <Heart
                size={22}
                color={liked ? palette.danger : palette.mutedText}
                fill={liked ? palette.danger : 'transparent'}
              />
            </Pressable>
            <Pressable hitSlop={12}>
              <Bookmark size={22} color={palette.mutedText} />
            </Pressable>
            <Pressable hitSlop={12}>
              <Share size={22} color={palette.mutedText} />
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          {/* Error */}
          {!!state.error && (
            <View style={[styles.errorContainer, { backgroundColor: palette.danger + '10' }]}>
              <Text style={[styles.error, { color: palette.danger }]}>{state.error}</Text>
              <Button label="Retry" onPress={() => void loadPost()} style={styles.retryButton} />
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    marginRight: spacing.md,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
  },
  authorName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  username: {
    fontSize: 15,
    marginTop: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  timestamp: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontWeight: '400',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs,
  },
  errorContainer: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  error: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.xs,
  },
});
