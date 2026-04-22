import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './client';

export type SavedPost = {
  id: number;
  title: string;
  body: string;
  savedAt: number;
};

function savedPostsCollection(userId: string) {
  return collection(db, 'users', userId, 'savedPosts');
}

export async function savePost(userId: string, post: Omit<SavedPost, 'savedAt'>): Promise<void> {
  const ref = doc(savedPostsCollection(userId), String(post.id));
  await setDoc(ref, {
    ...post,
    savedAt: Date.now(),
    syncedAt: serverTimestamp(),
  });
}

export async function unsavePost(userId: string, postId: number): Promise<void> {
  const ref = doc(savedPostsCollection(userId), String(postId));
  await deleteDoc(ref);
}

export function subscribeSavedPosts(
  userId: string,
  onData: (items: SavedPost[]) => void,
  onError?: (error: Error) => void
): () => void {
  const ref = query(savedPostsCollection(userId), orderBy('savedAt', 'desc'));

  return onSnapshot(
    ref,
    (snapshot) => {
      const items = snapshot.docs.map((item) => {
        const data = item.data() as SavedPost;
        return {
          id: data.id,
          title: data.title,
          body: data.body,
          savedAt: data.savedAt,
        };
      });
      onData(items);
    },
    (error) => {
      onError?.(error as Error);
    }
  );
}
