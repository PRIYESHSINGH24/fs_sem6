import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { showToast } from '../components/ToastProvider';
import {
  createPost,
  CreatePostInput,
  deletePost,
  subscribeAllPosts,
  UserPost,
} from '../services/firebase/userPosts';

type UserPostsContextType = {
  userPosts: UserPost[];
  isSyncing: boolean;
  isSubmitting: boolean;
  addPost: (input: { title: string; body: string; category: string }) => Promise<void>;
  removePost: (postId: string) => Promise<void>;
};

const UserPostsContext = createContext<UserPostsContextType | undefined>(undefined);

export function UserPostsProvider({ children }: React.PropsWithChildren) {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsSyncing(true);
    const unsubscribe = subscribeAllPosts(
      (items) => {
        setUserPosts(items);
        setIsSyncing(false);
      },
      (error) => {
        setIsSyncing(false);
        showToast('error', 'Post sync failed', error.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const addPost = async (input: { title: string; body: string; category: string }) => {
    if (!user) {
      showToast('error', 'Not signed in', 'Please login to create a post.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost({
        title: input.title,
        body: input.body,
        category: input.category,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorEmail: user.email || '',
      });
      showToast('success', 'Post published', 'Your post is live!');
    } catch (error) {
      showToast('error', 'Post failed', (error as Error).message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePost = async (postId: string) => {
    try {
      await deletePost(postId);
      showToast('info', 'Removed', 'Post deleted successfully.');
    } catch (error) {
      showToast('error', 'Delete failed', (error as Error).message);
    }
  };

  const value = useMemo(
    () => ({
      userPosts,
      isSyncing,
      isSubmitting,
      addPost,
      removePost,
    }),
    [userPosts, isSyncing, isSubmitting, user]
  );

  return <UserPostsContext.Provider value={value}>{children}</UserPostsContext.Provider>;
}

export function useUserPosts() {
  const context = useContext(UserPostsContext);
  if (!context) {
    throw new Error('useUserPosts must be used within UserPostsProvider');
  }
  return context;
}
