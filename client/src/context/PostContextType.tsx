// client/src/context/PostContextType.tsx
import { createContext } from 'react';
import { type Post } from '../types/index';

export interface PostContextType {
  posts: Post[];
  addPost: (content: string, user: { id: number; username: string }) => void;
  toggleLike: (postId: number, userId: number) => void;
}

export const PostContext = createContext<PostContextType | null>(null);