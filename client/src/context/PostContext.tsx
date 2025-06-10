import { type ReactNode, useState, useEffect } from 'react';
import { PostContext, type PostContextType } from './PostContextType';
import { type Post } from '../types/index';
import api from '../services/api';

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/api/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Erro ao buscar posts', error);
      }
    };
    fetchPosts();
  }, []);

  const addPost = async (formData: FormData) => {
    try {
      const response = await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPosts((prevPosts) => [response.data, ...prevPosts]);
    } catch (error) {
      console.error('Erro ao criar post', error);
      throw new Error('Erro ao criar post');
    }
  };

  const toggleLike = async (postId: number) => {
    try {
      const response = await api.post(`/api/posts/${postId}/like`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: response.data.likes, likedBy: response.data.likedBy }
            : post
        )
      );
    } catch (error) {
      console.error('Erro ao curtir/descurtir post', error);
      throw new Error('Erro ao curtir/descurtir post');
    }
  };

  const value: PostContextType = { posts, addPost, toggleLike };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}