import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

function normalize(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed || /^\$\{.+\}$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

function requireEnv(key: keyof Extra): string {
  const processFallbackMap: Record<keyof Extra, string | undefined> = {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  const value = normalize(extra[key]) ?? normalize(processFallbackMap[key]);
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  apiBaseUrl: requireEnv('apiBaseUrl'),
  firebaseApiKey: requireEnv('firebaseApiKey'),
  firebaseAuthDomain: requireEnv('firebaseAuthDomain'),
  firebaseProjectId: requireEnv('firebaseProjectId'),
  firebaseStorageBucket: requireEnv('firebaseStorageBucket'),
  firebaseMessagingSenderId: requireEnv('firebaseMessagingSenderId'),
  firebaseAppId: requireEnv('firebaseAppId'),
};
