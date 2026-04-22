import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { radius, spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export function SkeletonCard() {
  const { palette } = useTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [progress]);

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const baseColor = palette.skeletonBase;
  const highlightColor = palette.skeletonHighlight;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      {/* Header row: avatar + 2 lines */}
      <View style={styles.headerRow}>
        <Animated.View
          style={[styles.avatarSkeleton, { backgroundColor: baseColor, opacity }]}
        />
        <View style={styles.headerLines}>
          <Animated.View
            style={[styles.lineSkeleton, styles.lineShort, { backgroundColor: baseColor, opacity }]}
          />
          <Animated.View
            style={[styles.lineSkeleton, styles.lineXShort, { backgroundColor: highlightColor, opacity }]}
          />
        </View>
      </View>
      {/* Body lines */}
      <Animated.View
        style={[styles.lineSkeleton, styles.lineFull, { backgroundColor: baseColor, opacity }]}
      />
      <Animated.View
        style={[styles.lineSkeleton, styles.lineMedium, { backgroundColor: highlightColor, opacity }]}
      />
      <Animated.View
        style={[styles.lineSkeleton, styles.lineShort, { backgroundColor: baseColor, opacity }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md + 4,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  headerLines: {
    flex: 1,
    gap: 6,
  },
  lineSkeleton: {
    height: 12,
    borderRadius: 6,
  },
  lineXShort: {
    width: '30%',
  },
  lineShort: {
    width: '50%',
  },
  lineMedium: {
    width: '75%',
    marginTop: spacing.xs,
  },
  lineFull: {
    width: '100%',
    marginTop: spacing.xs,
  },
});
