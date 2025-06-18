import { useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from '../../styles/theme';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import Avatar from '../common/Avatar';

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
}

interface ProfileHeaderProps {
  user: User;
  isDarkMode: boolean;
  isOwnProfile: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUserAvatars: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

const DEFAULT_AVATAR = 'http://localhost:5000/uploads/default-avatar.png';

function ProfileHeader({ user, isDarkMode, isOwnProfile, setUser, setUserAvatars }: ProfileHeaderProps) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within its Provider');
  }
  // const { user: authUser } = authContext;
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpdate = async (file: File) => {
    if (!file) {
      toast.error('Selecione uma imagem válida');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido. Selecione uma imagem.');
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await api.put(`/api/users/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser((prev) => prev ? { ...prev, ...response.data } : response.data);
      setUserAvatars((prev) => ({
        ...prev,
        [user.id]: response.data.avatar || DEFAULT_AVATAR,
      }));
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      toast.success('Avatar atualizado com sucesso!');
    } catch (err: unknown) {
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      if (err instanceof AxiosError && err.response) {
        toast.error(err.response.data?.error || 'Erro ao atualizar avatar');
      } else {
        toast.error('Erro ao atualizar avatar');
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center mt-8">
      <div className="relative w-32 h-32">
        <Avatar
          src={user.avatar}
          username={user.username}
          size="lg"
        />
        {isOwnProfile && (
          <>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </label>
            <input
              type="file"
              accept="image/*"
              id="avatar-upload"
              ref={avatarInputRef}
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file) handleAvatarUpdate(file);
              }}
              className="hidden"
            />
          </>
        )}
      </div>
      <h2 className={isDarkMode ? theme.profile.titleDark : theme.profile.title}>{user.username}</h2>
      <p className={isDarkMode ? theme.profile.infoDark : theme.profile.info}>@{user.username}</p>
    </div>
  );
}

export default ProfileHeader;