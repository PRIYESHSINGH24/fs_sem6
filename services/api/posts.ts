import { apiClient } from './client';

export type RemotePost = {
  id: number;
  title: string;
  body: string;
};

export async function fetchRemotePosts(page: number, limit = 10, query = ''): Promise<RemotePost[]> {
  const start = (page - 1) * limit;
  const { data } = await apiClient.get<RemotePost[]>('/posts', {
    params: {
      _start: start,
      _limit: limit,
      q: query || undefined,
    },
  });
  return data;
}

export async function fetchPostById(id: number): Promise<RemotePost> {
  const { data } = await apiClient.get<RemotePost>(`/posts/${id}`);
  return data;
}
