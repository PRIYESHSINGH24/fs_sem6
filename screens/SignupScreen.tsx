import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import { UserPlus } from 'lucide-react-native';
import { Screen } from '../components/layout/Screen';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { signupSchema } from '../utils/validation';
import { showToast } from '../components/ToastProvider';
import { useTheme } from '../context/ThemeContext';
import { spacing, radius } from '../constants/theme';

export function SignupScreen() {
  const { signUp, isAuthenticating } = useAuth();
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
            <UserPlus size={28} color={palette.primary} />
          </View>
          <Text style={[styles.title, { color: palette.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: palette.mutedText }]}>
            Join the community and start exploring
          </Text>
        </View>

        <Formik
          initialValues={{ name: '', email: '', password: '' }}
          validationSchema={signupSchema}
          validateOnChange
          onSubmit={async (values) => {
            setAuthError('');
            try {
              await signUp(values);
              showToast('success', 'Account created', 'Welcome aboard.');
            } catch (error) {
              setAuthError((error as Error).message);
              showToast('error', 'Signup failed', (error as Error).message);
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
            <View>
              <Input
                label="Full name"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                autoCapitalize="words"
                error={touched.name ? errors.name : undefined}
              />
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
                label="Create Account"
                onPress={() => handleSubmit()}
                disabled={!isValid}
                loading={isAuthenticating}
              />
            </View>
          )}
        </Formik>

        <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.linkWrap}>
          <Text style={[styles.link, { color: palette.primary }]}>Already have an account? Login</Text>
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
    textAlign: 'center',
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
