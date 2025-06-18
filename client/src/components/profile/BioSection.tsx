import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from '../../styles/theme';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import ErrorMessage from '../common/ErrorMessage';

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
}

interface FollowUser {
  id: number;
  username: string;
  email: string;
}

interface BioSectionProps {
  user: User;
  isDarkMode: boolean;
  isOwnProfile: boolean;
  isFollowing: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>;
  setFollowersList: React.Dispatch<React.SetStateAction<FollowUser[]>>;
  setFollowingList: React.Dispatch<React.SetStateAction<FollowUser[]>>;
  setUserAvatars: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

function BioSection({
  user,
  isDarkMode,
  isOwnProfile,
  isFollowing,
  setUser,
  setIsFollowing,
  setFollowersList,
  setFollowingList,
  setUserAvatars,
}: BioSectionProps) {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within its Provider');
  }
  const { user: authUser } = authContext;
  const loggedInUserId = authUser ? authUser.id : null;
  const [bio, setBio] = useState(user.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [error, setError] = useState<string[]>([]);

  const handleUpdateBio = async () => {
    setError([]);
    const formData = new FormData();
    formData.append('bio', bio);
    try {
      const response = await api.put(`/api/users/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser((prev) => ({ ...prev, ...response.data }));
      setBio(response.data.bio || '');
      setIsEditingBio(false);
      toast.success('Bio atualizada com sucesso!');
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const errorMessage = err.response.data?.error || 'Erro ao atualizar bio';
        setError([errorMessage]);
        toast.error(errorMessage);
      } else {
        setError(['Erro ao atualizar bio']);
        toast.error('Erro ao atualizar bio');
      }
    }
  };

  const handleFollowToggle = async () => {
    if (!loggedInUserId) {
      toast.error('Faça login para seguir usuários.');
      navigate('/login');
      return;
    }
    try {
      const response = await api.post(`/api/users/${user.id}/follow`);
      setIsFollowing(!isFollowing);
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          followers: isFollowing ? (prev.followers || 0) - 1 : (prev.followers || 0) + 1,
        };
      });
      const [followersResponse, followingResponse] = await Promise.all([
        api.get(`/api/users/${user.id}/followers`),
        api.get(`/api/users/${user.id}/following`),
      ]);
      setFollowersList(followersResponse.data);
      setFollowingList(followingResponse.data);
      const allUserIds = [
        ...followersResponse.data.map((f: FollowUser) => f.id),
        ...followingResponse.data.map((f: FollowUser) => f.id),
      ];
      const uniqueIds = Array.from(new Set(allUserIds));
      const avatarPromises = uniqueIds.map((id) => api.get(`/api/users/${id}`));
      const avatarResponses = await Promise.all(avatarPromises);
      const newAvatars = avatarResponses.reduce((acc, res) => ({
        ...acc,
        [res.data.id]: res.data.avatar || 'http://localhost:5000/uploads/default-avatar.png',
      }), {});
      setUserAvatars((prev) => ({ ...prev, ...newAvatars }));
      toast.success(response.data.message);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof AxiosError && err.response?.data?.error
          ? err.response.data.error
          : 'Erro ao gerenciar follow';
      toast.error(errorMessage);
    }
  };

  return (
    <div className={isDarkMode ? theme.profile.bioContainerDark : theme.profile.bioContainer}>
      {isOwnProfile && isEditingBio ? (
        <>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 160))}
            placeholder="Adicione uma bio (máximo 160 caracteres)"
            className={`${isDarkMode ? theme.auth.inputDark : theme.auth.input} w-full h-24 resize-none text-center`}
          />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{bio.length}/160</p>
          <ErrorMessage errors={error} isDarkMode={isDarkMode} className="mt-2" />
          <div className="flex space-x-2 mt-2">
            <button
              type="button"
              onClick={handleUpdateBio}
              className={isDarkMode ? theme.auth.buttonDark : theme.auth.button}
            >
              Salvar Bio
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditingBio(false);
                setBio(user.bio || '');
                setError([]);
              }}
              className={isDarkMode ? theme.profile.cancelButtonDark : theme.profile.cancelButton}
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={isDarkMode ? theme.profile.bioTextDark : theme.profile.bioText}>
            {user.bio || 'Nenhuma bio definida'}
          </p>
          {isOwnProfile ? (
            <button
              type="button"
              onClick={() => setIsEditingBio(true)}
              className={isDarkMode ? theme.profile.editBioButtonDark : theme.profile.editBioButton}
            >
              Editar Bio
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFollowToggle}
              className={isDarkMode ? theme.auth.buttonDark : theme.auth.button}
            >
              {isFollowing ? 'Deixar de seguir' : 'Seguir'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default BioSection;