import { type ReactNode, useState } from 'react';
import { PostContext, type PostContextType } from './PostContextType';
import { type Post } from '../types/index';

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      content: 'Aprendendo #javascript no ConnectSphere!',
      createdAt: new Date().toISOString(),
      user: { id: 1, username: 'dev1' },
      likes: 0,
      likedBy: [], // Inicializado como vazio
    },
    {
      id: 2,
      content: 'Construindo um app com #react! #frontend',
      createdAt: new Date().toISOString(),
      user: { id: 2, username: 'dev2' },
      likes: 0,
      likedBy: [], // Inicializado como vazio
    },
  ]);

  const addPost = (content: string, user: { id: number; username: string }) => {
    const newPost: Post = {
      id: posts.length + 1,
      content,
      createdAt: new Date().toISOString(),
      user,
      likes: 0,
      likedBy: [], // Inicializado como vazio
    };
    setPosts([newPost, ...posts]);
  };

  const toggleLike = (postId: number, userId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const likedBy = post.likedBy.includes(userId)
            ? post.likedBy.filter((id) => id !== userId) // Remove o like
            : [...post.likedBy, userId]; // Adiciona o like
          return { ...post, likedBy, likes: likedBy.length };
        }
        return post;
      })
    );
  };

  const value: PostContextType = { posts, addPost, toggleLike };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}