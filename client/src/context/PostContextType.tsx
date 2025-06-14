import { createContext } from 'react';
import { type Post } from '../types/index';

export interface PostContextType {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  addPost: (formData: FormData) => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
  updatePost: (postId: number, formData: FormData) => Promise<Post>;
}

export const PostContext = createContext<PostContextType | null>(null);