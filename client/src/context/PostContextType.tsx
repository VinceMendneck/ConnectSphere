import { createContext } from 'react';
import { type Post, type Comment } from '../types/index';

export interface PostContextType {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  addPost: (formData: FormData) => Promise<Post>;
  toggleLike: (postId: number) => Promise<{ likes: number; likedBy: number[] }>;
  deletePost: (postId: number) => Promise<void>;
  updatePost: (postId: number, formData: FormData) => Promise<Post>;
  addComment: (postId: number, content: string, parentId?: number) => Promise<Comment>;
  toggleCommentLike: (commentId: number) => Promise<{ likes: number; likedBy: number[] }>;
  updateComment: (commentId: number, content: string) => Promise<Comment>;
  deleteComment: (commentId: number) => Promise<void>;
}

export const PostContext = createContext<PostContextType | null>(null);