import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { theme } from '../styles/theme';
import api from '../services/api';

interface Post {
  id: number;
  content: string;
  // Adicione outros campos conforme necessário
}

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  posts?: Post[];
}

function Profile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/users/${id}`);
        setUser(response.data);
        setBio(response.data.bio || '');
      } catch (err) {
        setError(['Erro ao carregar perfil']);
        console.error('Erro ao carregar perfil:', err);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError([]);
    const formData = new FormData();
    formData.append('bio', bio);
    if (avatar) formData.append('avatar', avatar);

    try {
      await api.put(`/api/users/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const response = await api.get(`/api/users/${id}`);
      setUser(response.data);
    } catch (err) {
      setError(['Erro ao atualizar perfil']);
      console.error('Erro ao atualizar perfil:', err);
    }
  };

  if (!user) return <div>Carregando...</div>;

  return (
    <div className={theme.profile.containerDark}>
      <h2 className={theme.profile.titleDark}>Perfil de {user.username}</h2>
      <div className="mb-4">
        <img
          src={user.avatar || '/default-avatar.png'}
          alt={`${user.username} avatar`}
          className="w-24 h-24 rounded-full"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files ? e.target.files[0] : null)}
          className={theme.auth.inputDark}
        />
      </div>
      <form onSubmit={handleUpdate} className="flex flex-col space-y-2">
        {error.length > 0 && (
          <div className="text-red-500 text-sm">
            {error.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        )}
        <input
          type="text"
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={theme.auth.inputDark}
        />
        <button type="submit" className={theme.auth.buttonDark}>
          Atualizar Perfil
        </button>
      </form>
      <p className={theme.profile.infoDark}>Email: {user.email}</p>
    </div>
  );
}

export default Profile;