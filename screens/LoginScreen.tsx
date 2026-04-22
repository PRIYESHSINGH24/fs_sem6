import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import { LogIn } from 'lucide-react-native';
import { Screen } from '../components/layout/Screen';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../utils/validation';
import { showToast } from '../components/ToastProvider';
import { useTheme } from '../context/ThemeContext';
import { spacing, radius } from '../constants/theme';

export function LoginScreen() {
  const { signIn, isAuthenticating } = useAuth();
  const { palette } = useTheme();
  const [authError, setAuthError] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Screen scroll>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Hero */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: palette.primary + '18' }]}>
            <LogIn size={28} color={palette.primary} />
          </View>
          <Text style={[styles.title, { color: palette.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: palette.mutedText }]}>
            Sign in to your account
          </Text>
        </View>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        validateOnChange
        onSubmit={async (values) => {
          setAuthError('');
          try {
            await signIn(values.email, values.password);
            showToast('success', 'Logged in', 'Your session has been restored.');
          } catch (error) {
            setAuthError((error as Error).message);
            showToast('error', 'Login failed', (error as Error).message);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
          <View>
            <Input
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={touched.email ? errors.email : undefined}
            />
            <Input
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
              error={touched.password ? errors.password : undefined}
            />
            {!!authError && (
              <Text style={[styles.authError, { color: palette.danger }]}>{authError}</Text>
            )}
            <Button
              label="Login"
              onPress={() => handleSubmit()}
              disabled={!isValid}
              loading={isAuthenticating}
            />
          </View>
        )}
      </Formik>

      <Pressable onPress={() => router.push('/(auth)/signup')} style={styles.linkWrap}>
        <Text style={[styles.link, { color: palette.primary }]}>No account? Create one</Text>
      </Pressable>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
  },
  linkWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
    padding: spacing.md,
  },
  link: {
    fontSize: 15,
    fontWeight: '700',
  },
  authError: {
    marginBottom: spacing.md,
    fontSize: 14,
    textAlign: 'center',
  },
});
