import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { spacing } from '../constants/theme';
import { showToast } from '../components/ToastProvider';

export function SettingsScreen() {
  const { user, logout, updateDisplayName, isAuthenticating } = useAuth();
  const { palette, mode, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
  }, [user?.displayName]);

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Text style={[styles.title, { color: palette.text }]}>Settings</Text>
        <Text style={[styles.meta, { color: palette.mutedText }]}>Signed in as: {user?.email}</Text>
        <Text style={[styles.meta, { color: palette.mutedText }]}>Display name: {user?.displayName || 'Not set'}</Text>
        <Text style={[styles.meta, { color: palette.mutedText }]}>Theme mode: {mode}</Text>

        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Update display name"
          placeholderTextColor={palette.mutedText}
          style={[
            styles.input,
            {
              borderColor: palette.border,
              backgroundColor: palette.card,
              color: palette.text,
            },
          ]}
        />

        <Button
          label={isAuthenticating ? 'Saving...' : 'Save profile'}
          onPress={async () => {
            try {
              await updateDisplayName(displayName);
              showToast('success', 'Profile updated', 'Display name synced.');
            } catch (error) {
              showToast('error', 'Update failed', (error as Error).message);
            }
          }}
          style={styles.button}
        />

        <Button label="Toggle dark mode" onPress={toggleTheme} style={styles.button} />
        <Button
          label="Logout"
          onPress={async () => {
            await logout();
            showToast('info', 'Signed out', 'Session ended securely.');
          }}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  meta: {
    fontSize: 15,
  },
  button: {
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
});
