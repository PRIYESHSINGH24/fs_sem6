import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { showToast } from '../components/ToastProvider';
import { getItem, setItem, storageKeys } from '../services/storage/local';
import { savePost, SavedPost, subscribeSavedPosts, unsavePost } from '../services/firebase/savedPosts';

type TogglePostInput = {
  id: number;
  title: string;
  body: string;
};

type SavedPostsContextType = {
  savedPosts: SavedPost[];
  isSyncing: boolean;
  isSaved: (postId: number) => boolean;
  toggleSavedPost: (post: TogglePostInput) => Promise<void>;
};

const SavedPostsContext = createContext<SavedPostsContextType | undefined>(undefined);

function getCacheKey(uid?: string) {
  return uid ? `${storageKeys.savedPostsPrefix}${uid}` : `${storageKeys.savedPostsPrefix}guest`;
}

export function SavedPostsProvider({ children }: React.PropsWithChildren) {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const key = getCacheKey(user?.uid);

    (async () => {
      const cached = await getItem<SavedPost[]>(key);
      if (mounted && cached) {
        setSavedPosts(cached);
      }
    })();

    if (!user) {
      return () => {
        mounted = false;
      };
    }

    setIsSyncing(true);
    const unsubscribe = subscribeSavedPosts(
      user.uid,
      async (items) => {
        if (!mounted) {
          return;
        }
        setSavedPosts(items);
        await setItem(key, items);
        setIsSyncing(false);
      },
      (error) => {
        if (!mounted) {
          return;
        }
        setIsSyncing(false);
        showToast('error', 'Save sync failed', error.message);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [user]);

  const isSaved = (postId: number) => {
    return savedPosts.some((item) => item.id === postId);
  };

  const toggleSavedPost = async (post: TogglePostInput) => {
    if (!user) {
      showToast('error', 'Action blocked', 'Please login to save posts.');
      return;
    }

    const currentlySaved = isSaved(post.id);

    if (currentlySaved) {
      await unsavePost(user.uid, post.id);
      showToast('info', 'Removed', 'Post removed from saved list.');
      return;
    }

    await savePost(user.uid, post);
    showToast('success', 'Saved', 'Post added to your saved list.');
  };

  const value = useMemo(
    () => ({
      savedPosts,
      isSyncing,
      isSaved,
      toggleSavedPost,
    }),
    [savedPosts, isSyncing]
  );

  return <SavedPostsContext.Provider value={value}>{children}</SavedPostsContext.Provider>;
}

export function useSavedPosts() {
  const context = useContext(SavedPostsContext);
  if (!context) {
    throw new Error('useSavedPosts must be used within SavedPostsProvider');
  }
  return context;
}
