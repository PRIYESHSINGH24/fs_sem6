import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function RootSplashScreen() {
  const { palette } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.logo, { color: palette.primary }]}>PulseStack</Text>
      <Text style={[styles.subtitle, { color: palette.mutedText }]}>Loading your workspace...</Text>
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
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
  },
});
