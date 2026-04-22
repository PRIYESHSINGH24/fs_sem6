import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { Heart, MessageSquare, Repeat2, Bookmark } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing } from '../../constants/theme';

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onPress?: () => void;
  isSaved?: boolean;
  category?: string;
  authorName?: string;
};

// Simple pseudo-random fallback avatar generator
const getAvatarURL = (name: string) => `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

// Stable pseudo-random number from string seed (avoids re-renders changing values)
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function CardComponent({ title, description, actionLabel, onActionPress, onPress, isSaved, category, authorName }: Props) {
  const { palette } = useTheme();
  
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const likeCount = useMemo(() => (hashCode(title) % 100) + 1, [title]);
  const commentCount = useMemo(() => (hashCode(title + 'c') % 20) + 1, [title]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: pressed ? palette.skeletonHighlight : palette.card,
            borderColor: palette.border,
            shadowColor: palette.text,
          },
        ]}
      >
        {/* Category badge */}
        {!!category && (
          <View style={[styles.categoryBadge, { backgroundColor: palette.primary + '12' }]}>
            <Text style={[styles.categoryBadgeText, { color: palette.primary }]}>{category}</Text>
          </View>
        )}

        <View style={styles.header}>
          <Image style={styles.avatar} source={{ uri: getAvatarURL(authorName || title) }} />
          <View style={styles.info}>
            <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[styles.username, { color: palette.mutedText }]}>
              {authorName ? `@${authorName.toLowerCase().replace(/\s/g, '_')}` : `@user_${title.slice(0, 5).toLowerCase().replace(/\s/g, '')}`} • 2h
            </Text>
          </View>
        </View>
        <Text style={[styles.description, { color: palette.text }]} numberOfLines={3}>
          {description}
        </Text>

        <View style={[styles.divider, { backgroundColor: palette.border }]} />

        <View style={styles.actionsRow}>
          <View style={styles.leftActions}>
            <Pressable style={styles.iconButton} hitSlop={12}>
              <Heart size={17} color={palette.mutedText} />
              <Text style={[styles.iconCount, { color: palette.mutedText }]}>{likeCount}</Text>
            </Pressable>
            <Pressable style={styles.iconButton} hitSlop={12}>
              <MessageSquare size={17} color={palette.mutedText} />
              <Text style={[styles.iconCount, { color: palette.mutedText }]}>{commentCount}</Text>
            </Pressable>
            <Pressable style={styles.iconButton} hitSlop={12}>
              <Repeat2 size={17} color={palette.mutedText} />
            </Pressable>
          </View>

          {!!onActionPress && (
            <Pressable onPress={onActionPress} hitSlop={12} style={styles.rightAction}>
              <Bookmark size={20} color={isSaved ? palette.primary : palette.mutedText} fill={isSaved ? palette.primary : "transparent"} />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const Card = React.memo(CardComponent);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.md + 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  info: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    marginRight: spacing.md,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  username: {
    fontSize: 13,
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  iconCount: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  rightAction: {
    padding: 4,
  },
});
