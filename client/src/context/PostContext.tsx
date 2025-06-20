import { type ReactNode, useState, useEffect } from 'react';
import { PostContext, type PostContextType } from './PostContextType';
import { type Post, type Comment } from '../types/index';
import api from '../services/api';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/api/posts');
      console.log('Posts fetched:', response.data);
      const normalizedPosts = response.data.map((post: Post) => ({
        ...post,
        createdAt: new Date(post.createdAt).toISOString(),
      }));
      setPosts(normalizedPosts);
      console.log('Estado posts inicializado:', normalizedPosts);
      return normalizedPosts;
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      toast.error('Erro ao atualizar lista de posts.');
      throw error;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const addPost = async (formData: FormData) => {
    try {
      const response = await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Post criado:', response.data);
      const newPost: Post = {
        ...response.data,
        createdAt: new Date(response.data.createdAt).toISOString(),
      };
      setPosts((prevPosts) => {
        const updatedPosts = [newPost, ...prevPosts];
        console.log('Estado posts atualizado (addPost):', updatedPosts);
        return [...updatedPosts]; // Força nova referência
      });
      return newPost;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw new Error('Erro ao criar post');
    }
  };

  const deletePost = async (postId: number) => {
    try {
      await api.delete(`/api/posts/${postId}`);
      console.log('Post excluído:', postId);
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.filter((post) => post.id !== postId);
        console.log('Estado posts atualizado (deletePost):', updatedPosts);
        return [...updatedPosts]; // Força nova referência
      });
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      throw new Error('Erro ao excluir post');
    }
  };

  const toggleLike = async (postId: number): Promise<{ likes: number; likedBy: number[] }> => {
    try {
      const response = await api.post(`/api/posts/${postId}/like`);
      console.log('Like toggled:', { postId, response: response.data });
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: response.data.likes, likedBy: response.data.likedBy }
            : post
        );
        console.log('Estado posts atualizado (toggleLike):', updatedPosts);
        return [...updatedPosts]; // Força nova referência
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao curtir/descurtir post:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
      }
      throw error;
    }
  };

  const updatePost = async (postId: number, formData: FormData): Promise<Post> => {
    try {
      const response = await api.put(`/api/posts/${postId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Post atualizado:', response.data);
      const updatedPost: Post = {
        ...response.data,
        createdAt: new Date(response.data.createdAt).toISOString(),
      };
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => (post.id === postId ? updatedPost : post));
        console.log('Estado posts atualizado (updatePost):', updatedPosts);
        return [...updatedPosts]; // Força nova referência
      });
      return updatedPost;
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      throw new Error('Erro ao atualizar post');
    }
  };

  const addComment = async (postId: number, content: string, parentId?: number): Promise<Comment> => {
    try {
      const response = await api.post('/api/comments', { postId, content, parentId });
      console.log('Comentário adicionado:', response.data);
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) =>
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
        );
        console.log('Estado posts atualizado (addComment):', updatedPosts);
        return [...updatedPosts]; // Força nova referência
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
      }
      throw error;
    }
  };

  const toggleCommentLike = async (commentId: number): Promise<{ likes: number; likedBy: number[] }> => {
    try {
      const response = await api.post(`/api/comments/${commentId}/like`);
      console.log('Like de comentário toggled:', { commentId, response: response.data });
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => ({
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
        }));
        console.log('Estado posts atualizado (toggleCommentLike):', updatedPosts);
        return [...updatedPosts]; // Força nova referência
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao curtir/descurtir comentário:', error);
      if (error instanceof AxiosError && error.response) {
        console.log('Detalhes do erro:', error.response.data, 'Status:', error.response.status);
      }
      throw error;
    }
  };

  const updateComment = async (commentId: number, content: string): Promise<Comment> => {
    try {
      const response = await api.put(`/api/comments/${commentId}`, { content });
      console.log('Comentário atualizado:', response.data);
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => ({
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
        }));
        console.log('Estado posts atualizado (updateComment):', updatedPosts);
        return [...updatedPosts]; // Força nova referência
      });
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
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => ({
          ...post,
          comments: post.comments
            ?.filter((comment) => comment.id !== commentId)
            .map((comment) => ({
              ...comment,
              replies: comment.replies?.filter((reply) => reply.id !== commentId) || [],
            })) || [],
        }));
        console.log('Estado posts atualizado (deleteComment):', updatedPosts);
        return [...updatedPosts]; // Força nova referência
      });
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

  return <PostContext.Provider key={posts.length} value={value}>{children}</PostContext.Provider>;
}