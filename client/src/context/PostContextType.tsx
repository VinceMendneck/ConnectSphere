import { createContext } from 'react';
import { type Post } from '../types/index';

export interface PostContextType {
  posts: Post[];
  addPost: (formData: FormData) => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
}

export const PostContext = createContext<PostContextType | null>(null);