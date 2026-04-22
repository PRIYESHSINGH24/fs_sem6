import React from 'react';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
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
};

// Simple pseudo-random fallback avatar generator
const getAvatarURL = (name: string) => `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

function CardComponent({ title, description, actionLabel, onActionPress, onPress, isSaved }: Props) {
  const { palette } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          shadowColor: palette.text,
        },
      ]}
    >
      <View style={styles.header}>
        <Image style={styles.avatar} source={{ uri: getAvatarURL(title) }} />
        <View style={styles.info}>
          <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.username, { color: palette.mutedText }]}>@user_{title.slice(0, 5).toLowerCase().replace(/\s/g, '')} • 2h</Text>
        </View>
      </View>
      <Text style={[styles.description, { color: palette.text }]} numberOfLines={3}>
        {description}
      </Text>

      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          <Pressable style={styles.iconButton} hitSlop={12}>
            <Heart size={18} color={palette.mutedText} />
            <Text style={[styles.iconCount, { color: palette.mutedText }]}>{Math.floor(Math.random() * 100) + 1}</Text>
          </Pressable>
          <Pressable style={styles.iconButton} hitSlop={12}>
            <MessageSquare size={18} color={palette.mutedText} />
            <Text style={[styles.iconCount, { color: palette.mutedText }]}>{Math.floor(Math.random() * 20) + 1}</Text>
          </Pressable>
          <Pressable style={styles.iconButton} hitSlop={12}>
            <Repeat2 size={18} color={palette.mutedText} />
          </Pressable>
        </View>

        {!!onActionPress && (
          <Pressable onPress={onActionPress} hitSlop={12} style={styles.rightAction}>
            <Bookmark size={20} color={isSaved ? palette.primary : palette.mutedText} fill={isSaved ? palette.primary : "transparent"} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export const Card = React.memo(CardComponent);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 16,
    fontWeight: '700',
  },
  username: {
    fontSize: 13,
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
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
