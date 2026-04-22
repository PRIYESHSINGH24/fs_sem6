import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

export default function CreatePostRoute() {
  const { palette } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.label, { color: palette.text }]}>New Post Feature Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
  }
});