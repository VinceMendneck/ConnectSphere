// client/src/context/PostContextType.tsx
import { createContext } from 'react';
import { type Post } from '../types/index';

export interface PostContextType {
  posts: Post[];
  addPost: (content: string) => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
}

export const PostContext = createContext<PostContextType | null>(null);