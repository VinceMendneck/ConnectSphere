import { type ReactNode, useState, useEffect } from 'react';
import { PostContext, type PostContextType } from './PostContextType';
import { type Post, type Comment } from '../types/index';
import api from '../services/api';
import { AxiosError } from 'axios';

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/api/posts');
        console.log('Posts fetched:', response.data);
        setPosts(response.data);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const addPost = async (formData: FormData) => {
    try {
      const response = await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Post criado:', response.data);
      setPosts((prevPosts) => [response.data, ...prevPosts]);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw new Error('Erro ao criar post');
    }
  };

  const toggleLike = async (postId: number): Promise<{ likes: number; likedBy: number[] }> => {
    try {
      const response = await api.post(`/api/posts/${postId}/like`);
      console.log('Like toggled:', { postId, response: response.data });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: response.data.likes, likedBy: response.data.likedBy }
            : post
        )
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao curtir/descurtir post:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
      }
      throw error; // Alterado para propagar o erro original
    }
  };

  const deletePost = async (postId: number) => {
    try {
      await api.delete(`/api/posts/${postId}`);
      console.log('Post excluído:', postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      throw new Error('Erro ao excluir post');
    }
  };

  const updatePost = async (postId: number, formData: FormData): Promise<Post> => {
    try {
      const response = await api.put(`/api/posts/${postId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Post atualizado:', response.data);
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? response.data : post))
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      throw new Error('Erro ao atualizar post');
    }
  };

  const addComment = async (postId: number, content: string, parentId?: number): Promise<Comment> => {
    try {
      const response = await api.post('/api/comments', { postId, content, parentId });
      console.log('Comentário adicionado:', response.data);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: parentId
                  ? post.comments?.map((comment) =>
                      comment.id === parentId
                        ? { ...comment, replies: [...(comment.replies || []), response.data] }
                        : comment
                    ) || [response.data]
                  : [...(post.comments || []), response.data],
              }
            : post
        )
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
      }
      throw error; // Alterado para propagar o erro original
    }
  };

  const toggleCommentLike = async (commentId: number): Promise<{ likes: number; likedBy: number[] }> => {
    try {
      const response = await api.post(`/api/comments/${commentId}/like`);
      console.log('Like de comentário toggled:', { commentId, response: response.data });
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          comments: post.comments?.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: response.data.likes,
                  likedBy: response.data.likedBy,
                }
              : {
                  ...comment,
                  replies: comment.replies?.map((reply) =>
                    reply.id === commentId
                      ? {
                          ...reply,
                          likes: response.data.likes,
                          likedBy: response.data.likedBy,
                        }
                      : reply
                  ) || [],
                }
          ) || [],
        }))
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao curtir/descurtir comentário:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
      }
      throw error; // Alterado para propagar o erro original
    }
  };

  const updateComment = async (commentId: number, content: string): Promise<Comment> => {
    try {
      const response = await api.put(`/api/comments/${commentId}`, { content });
      console.log('Comentário atualizado:', response.data);
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          comments: post.comments?.map((comment) =>
            comment.id === commentId
              ? response.data
              : {
                  ...comment,
                  replies: comment.replies?.map((reply) =>
                    reply.id === commentId ? response.data : reply
                  ) || [],
                }
          ) || [],
        }))
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
      }
      throw error;
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await api.delete(`/api/comments/${commentId}`);
      console.log('Comentário excluído:', commentId);
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          comments: post.comments
            ?.filter((comment) => comment.id !== commentId)
            .map((comment) => ({
              ...comment,
              replies: comment.replies?.filter((reply) => reply.id !== commentId) || [],
            })) || [],
        }))
      );
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
      }
      throw error;
    }
  };

  const value: PostContextType = {
    posts,
    setPosts,
    addPost,
    toggleLike,
    deletePost,
    updatePost,
    addComment,
    toggleCommentLike,
    updateComment,
    deleteComment,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}