import { useState, useCallback } from 'react';
import api from '../services/api';

const DEFAULT_AVATAR = 'http://localhost:5000/uploads/default-avatar.png';

function useAvatars() {
  const [userAvatars, setUserAvatars] = useState<Record<number, string>>({});
  const [loadingAvatars, setLoadingAvatars] = useState<boolean>(false);

  const fetchUserAvatars = useCallback(async (userIds: number[]) => {
    const uniqueIds = Array.from(new Set(userIds)).filter(id => !userAvatars[id]);
    if (uniqueIds.length === 0) {
      setLoadingAvatars(false);
      return;
    }
    setLoadingAvatars(true);
    try {
      const avatarPromises = uniqueIds.map(id => api.get(`/api/users/${id}`));
      const responses = await Promise.all(avatarPromises);
      const newAvatars = responses.reduce((acc, response) => {
        const avatar =
          response.data.avatar && response.data.avatar.trim() !== ''
            ? response.data.avatar
            : DEFAULT_AVATAR;
        return { ...acc, [response.data.id]: avatar };
      }, {} as Record<number, string>);
      setUserAvatars(prev => ({ ...prev, ...newAvatars }));
    } catch (err) {
      console.error('Erro ao buscar avatares:', err);
      uniqueIds.forEach(id => {
        setUserAvatars(prev => ({ ...prev, [id]: DEFAULT_AVATAR }));
      });
    } finally {
      setLoadingAvatars(false);
    }
  }, [userAvatars]);

  const fetchUserAvatar = useCallback(async (userId: number) => {
    if (userAvatars[userId]) return;
    setLoadingAvatars(true);
    try {
      const response = await api.get(`/api/users/${userId}`);
      const avatar =
        response.data.avatar && response.data.avatar.trim() !== ''
          ? response.data.avatar
          : DEFAULT_AVATAR;
      setUserAvatars(prev => ({ ...prev, [userId]: avatar }));
    } catch (err) {
      console.error(`Erro ao buscar avatar do usuário ${userId}:`, err);
      setUserAvatars(prev => ({ ...prev, [userId]: DEFAULT_AVATAR }));
    } finally {
      setLoadingAvatars(false);
    }
  }, [userAvatars]);

  return {
    userAvatars,
    setUserAvatars,
    loadingAvatars,
    fetchUserAvatars,
    fetchUserAvatar,
  };
}

export default useAvatars;