import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SavedPostsProvider } from '../context/SavedPostsContext';
import { RootSplashScreen } from '../screens/RootSplashScreen';
import { AppToast } from '../components/ToastProvider';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

SplashScreen.preventAutoHideAsync().catch(() => null);

function RouteGuard() {
  const { user, isBootstrapping } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(app)/(drawer)/feed');
    }
  }, [isBootstrapping, user, segments, router]);

  useEffect(() => {
    if (!isBootstrapping) {
      SplashScreen.hideAsync().catch(() => null);
    }
  }, [isBootstrapping]);

  if (isBootstrapping) {
    return <RootSplashScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SavedPostsProvider>
            <RouteGuard />
            <AppToast />
          </SavedPostsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
