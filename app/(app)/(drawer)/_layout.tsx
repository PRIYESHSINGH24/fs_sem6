import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';
import { Home, Bookmark, Settings, PlusCircle } from 'lucide-react-native';

export default function DrawerLayout() {
  const { palette } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: palette.card, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '700' },
        headerTintColor: palette.text,
        sceneStyle: { backgroundColor: palette.background },
        tabBarStyle: { 
          backgroundColor: palette.card, 
          borderTopWidth: 1, 
          borderTopColor: palette.border,
          elevation: 0,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.mutedText,
        tabBarShowLabel: false, // Modern cleaner look
      }}
    >
      <Tabs.Screen 
        name="feed" 
        options={{ 
          title: 'Feed',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="create" 
        options={{ 
          title: 'Post',
          tabBarIcon: ({ color, size }) => <PlusCircle color={palette.primary} size={size + 6} strokeWidth={2.5} /> 
        }} 
      />
      <Tabs.Screen 
        name="saved" 
        options={{ 
          title: 'Bookmarks',
          tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> 
        }} 
      />
    </Tabs>
  );
}
