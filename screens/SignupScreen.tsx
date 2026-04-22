import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import { Screen } from '../components/layout/Screen';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { signupSchema } from '../utils/validation';
import { showToast } from '../components/ToastProvider';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../constants/theme';

export function SignupScreen() {
  const { signUp, isAuthenticating } = useAuth();
  const { palette } = useTheme();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Create account</Text>
        <Text style={[styles.subtitle, { color: palette.mutedText }]}>Join and start exploring</Text>
      </View>

      <Formik
        initialValues={{ name: '', email: '', password: '' }}
        validationSchema={signupSchema}
        validateOnChange
        onSubmit={async (values) => {
          try {
            await signUp(values);
            showToast('success', 'Account created', 'Welcome aboard.');
          } catch (error) {
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
            <Button
              label={isAuthenticating ? 'Creating...' : 'Signup'}
              onPress={() => handleSubmit()}
              disabled={isAuthenticating || !isValid}
            />
          </View>
        )}
      </Formik>

      <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.linkWrap}>
        <Text style={[styles.link, { color: palette.primary }]}>Already have an account? Login</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
  },
  linkWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
