import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { spacing, radius } from '../constants/theme';
import { showToast } from '../components/ToastProvider';

export function SettingsScreen() {
  const { user, logout, updateDisplayName, isAuthenticating } = useAuth();
  const { palette, mode, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
  }, [user?.displayName]);

  return (
    <Screen scroll>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: palette.primary + '18' }]}>
            <SettingsIcon size={24} color={palette.primary} />
          </View>
          <Text style={[styles.title, { color: palette.text }]}>Settings</Text>
        </View>

        {/* Account Section */}
        <Text style={[styles.sectionTitle, { color: palette.mutedText }]}>ACCOUNT</Text>
        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.settingRow}>
            <User size={18} color={palette.mutedText} />
            <Text style={[styles.settingLabel, { color: palette.text }]}>Email</Text>
            <Text style={[styles.settingValue, { color: palette.mutedText }]}>{user?.email}</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: palette.border }]} />
          <View style={styles.settingRow}>
            <Shield size={18} color={palette.mutedText} />
            <Text style={[styles.settingLabel, { color: palette.text }]}>Display Name</Text>
            <Text style={[styles.settingValue, { color: palette.mutedText }]}>{user?.displayName || 'Not set'}</Text>
          </View>
        </View>

        {/* Update Name */}
        <Text style={[styles.sectionTitle, { color: palette.mutedText }]}>UPDATE PROFILE</Text>
        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter new display name"
            placeholderTextColor={palette.mutedText}
            style={[styles.input, { color: palette.text, borderColor: palette.border }]}
          />
          <Button
            label="Save Profile"
            loading={isAuthenticating}
            onPress={async () => {
              try {
                await updateDisplayName(displayName);
                showToast('success', 'Profile updated', 'Display name synced.');
              } catch (error) {
                showToast('error', 'Update failed', (error as Error).message);
              }
            }}
            style={styles.saveButton}
          />
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionTitle, { color: palette.mutedText }]}>PREFERENCES</Text>
        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Pressable style={styles.settingRow} onPress={toggleTheme}>
            <Moon size={18} color={palette.mutedText} />
            <Text style={[styles.settingLabel, { color: palette.text }]}>Dark Mode</Text>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ true: palette.primary, false: palette.border }}
              thumbColor="#fff"
            />
          </Pressable>
        </View>

        {/* Logout */}
        <Pressable
          style={[styles.logoutCard, { backgroundColor: palette.danger + '08', borderColor: palette.danger + '25' }]}
          onPress={async () => {
            await logout();
            showToast('info', 'Signed out', 'Session ended securely.');
          }}
        >
          <LogOut size={18} color={palette.danger} />
          <Text style={[styles.logoutText, { color: palette.danger }]}>Sign Out</Text>
          <ChevronRight size={18} color={palette.danger} style={{ marginLeft: 'auto' }} />
        </Pressable>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
    maxWidth: '50%',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    marginVertical: spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  saveButton: {
    // inherits Button defaults
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md + 2,
    marginTop: spacing.md,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
