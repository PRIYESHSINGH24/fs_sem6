import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase/client';
import {
  getSecureItem,
  removeSecureItem,
  setSecureItem,
  storageKeys,
} from '../services/storage/local';

type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticating: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: SignupPayload) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        await setSecureItem(storageKeys.secureSession, nextUser.uid);
      } else {
        await removeSecureItem(storageKeys.secureSession);
      }
      setIsBootstrapping(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    (async () => {
      await getSecureItem(storageKeys.secureSession);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signUp = async ({ name, email, password }: SignupPayload) => {
    setIsAuthenticating(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });

      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        email: credential.user.email,
        name: name.trim(),
        createdAt: serverTimestamp(),
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    await removeSecureItem(storageKeys.secureSession);
  };

  const updateDisplayName = async (name: string) => {
    const nextName = name.trim();
    if (!nextName) {
      throw new Error('Display name cannot be empty.');
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No active user session found.');
    }

    setIsAuthenticating(true);
    try {
      await updateProfile(currentUser, { displayName: nextName });
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          name: nextName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await currentUser.reload();
      setUser(auth.currentUser);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isBootstrapping,
      isAuthenticating,
      signIn,
      signUp,
      updateDisplayName,
      logout,
    }),
    [user, isBootstrapping, isAuthenticating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
