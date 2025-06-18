import { useState, useEffect, useContext, useCallback } from 'react';
import { PostContext } from '../context/PostContextType';
import api from '../services/api';
import { type Post } from '../types/index';
import useAvatars from './useAvatars';

interface UsePostsOptions {
  hashtag?: string;
}

function usePosts({ hashtag }: UsePostsOptions = {}) {
  const postContext = useContext(PostContext);
  if (!postContext) {
    throw new Error('PostContext must be used within its Provider');
  }
  const { posts: globalPosts, setPosts } = postContext;
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { userAvatars, fetchUserAvatars, fetchUserAvatar, loadingAvatars } = useAvatars();

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    setError(null);
    try {
      const endpoint = hashtag ? `/api/posts/hashtag/${hashtag}` : '/api/posts';
      const response = await api.get(endpoint);
      if (Array.isArray(response.data)) {
        setLocalPosts(response.data);
        if (!hashtag) {
          setPosts(response.data);
        }
        const userIds: number[] = [];
        response.data.forEach((post: Post) => {
          userIds.push(post.user.id);
          post.comments?.forEach((comment) => {
            userIds.push(comment.user.id);
            comment.replies?.forEach((reply) => userIds.push(reply.user.id));
          });
        });
        await fetchUserAvatars(userIds);
      } else {
        setLocalPosts([]);
        setError('Resposta inválida da API');
      }
    } catch (err) {
      console.error('Erro ao buscar posts:', err);
      setLocalPosts([]);
      setError('Erro ao carregar posts. Tente novamente mais tarde.');
    } finally {
      setLoadingPosts(false);
    }
  }, [hashtag, setPosts, fetchUserAvatars]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchPosts();
    }
    return () => {
      isMounted = false;
    };
  }, [fetchPosts]);

  useEffect(() => {
    setLocalPosts((prevPosts) => {
      const updatedPosts = prevPosts.map((post) => {
        const globalPost = globalPosts.find((gp) => gp.id === post.id);
        return globalPost || post;
      });
      if (JSON.stringify(updatedPosts) !== JSON.stringify(prevPosts)) {
        return updatedPosts;
      }
      return prevPosts;
    });
  }, [globalPosts]);

  return {
    posts: localPosts,
    setPosts: setLocalPosts,
    loadingPosts,
    loadingAvatars,
    error,
    userAvatars,
    fetchPosts,
    fetchUserAvatar,
  };
}

export default usePosts;