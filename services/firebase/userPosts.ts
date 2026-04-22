import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './client';

export type UserPost = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  category: string;
  createdAt: number;
};

export type CreatePostInput = {
  title: string;
  body: string;
  category: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
};

function postsCollection() {
  return collection(db, 'posts');
}

export async function createPost(input: CreatePostInput): Promise<string> {
  const docRef = await addDoc(postsCollection(), {
    ...input,
    createdAt: Date.now(),
    syncedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deletePost(postId: string): Promise<void> {
  const ref = doc(postsCollection(), postId);
  await deleteDoc(ref);
}

export function subscribeAllPosts(
  onData: (items: UserPost[]) => void,
  onError?: (error: Error) => void
): () => void {
  const ref = query(postsCollection(), orderBy('createdAt', 'desc'));

  return onSnapshot(
    ref,
    (snapshot) => {
      const items: UserPost[] = snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          title: data.title ?? '',
          body: data.body ?? '',
          authorId: data.authorId ?? '',
          authorName: data.authorName ?? '',
          authorEmail: data.authorEmail ?? '',
          category: data.category ?? 'General',
          createdAt: data.createdAt ?? 0,
        };
      });
      onData(items);
    },
    (error) => {
      onError?.(error as Error);
    }
  );
}
