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
    outputRange: [0.4, 0.9],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: palette.skeletonBase, borderColor: palette.border },
        { opacity },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    height: 112,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
});
