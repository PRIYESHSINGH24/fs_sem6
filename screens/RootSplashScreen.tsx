import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function RootSplashScreen() {
  const { palette } = useTheme();
  const fadeText = useRef(new Animated.Value(0)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeText, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(pulseScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeSubtitle, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Animated.Text
        style={[
          styles.logo,
          {
            color: palette.primary,
            opacity: fadeText,
            transform: [{ scale: pulseScale }],
          },
        ]}
      >
        PulseStack
      </Animated.Text>
      <Animated.Text
        style={[styles.subtitle, { color: palette.mutedText, opacity: fadeSubtitle }]}
      >
        Loading your workspace...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
});
