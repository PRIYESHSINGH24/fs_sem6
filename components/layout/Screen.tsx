import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
};

export function Screen({ children, scroll = false, contentContainerStyle }: Props) {
  const { mode, palette } = useTheme();

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <ScrollView contentContainerStyle={[styles.scrollContent, contentContainerStyle]}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }, contentContainerStyle]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});
