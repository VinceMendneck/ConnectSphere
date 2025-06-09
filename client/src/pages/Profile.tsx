// client/src/pages/Profile.tsx
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContextType';
import { PostContext } from '../context/PostContextType';
import { theme } from '../styles/theme';
import { type Post } from '../types/index';
import api from '../services/api';
import { renderHashtags } from '../utils/renderHashtags';

interface ProfileData {
  id: number;
  username: string;
  email: string;
  posts: Post[];
}

function Profile() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id || '0', 10);
  const authContext = useContext(AuthContext);
  const postContext = useContext(PostContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  if (!postContext) {
    throw new Error('PostContext must be used within a PostProvider');
  }
  const { user } = authContext;
  const { toggleLike } = postContext;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains('dark-theme')
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/api/users/${userId}`);
        setProfile(response.data);
      } catch (error) {
        toast.error('Erro ao carregar perfil');
        console.error(error);
      }
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleLike = async (postId: number) => {
    if (!user) {
      toast.error('Faça login para curtir!');
      return;
    }
    try {
      await toggleLike(postId);
    } catch (error) {
      toast.error('Erro ao curtir/descurtir post');
    }
  };

  if (!profile) {
    return (
      <div className={isDarkMode ? theme.profile.containerDark : theme.profile.container}>
        <p className={isDarkMode ? theme.profile.emptyMessageDark : theme.profile.emptyMessage}>
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? theme.profile.containerDark : theme.profile.container}>
      <h2 className={isDarkMode ? theme.profile.titleDark : theme.profile.title}>
        Perfil de @{profile.username}
      </h2>
      <p className={isDarkMode ? theme.profile.infoDark : theme.profile.info}>
        Email: {profile.email}
      </p>
      <div className={theme.profile.postList}>
        {profile.posts.length === 0 ? (
          <p className={isDarkMode ? theme.profile.emptyMessageDark : theme.profile.emptyMessage}>
            Nenhum post encontrado.
          </p>
        ) : (
          profile.posts.map((post) => {
            const isLiked = user && post.likedBy.includes(user.id);
            return (
              <div
                key={post.id}
                className={isDarkMode ? theme.profile.postContainerDark : theme.profile.postContainer}
              >
                <p className={isDarkMode ? theme.profile.postContentDark : theme.profile.postContent}>
                  {renderHashtags(post.content)}
                </p>
                <div className={isDarkMode ? theme.profile.postMetaDark : theme.profile.postMeta}>
                  <span>Por {post.user.username}</span> ·{' '}
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                  <button
                    onClick={() => handleLike(post.id)}
                    className={
                      isDarkMode
                        ? isLiked
                          ? theme.profile.likedButtonDark
                          : theme.profile.likeButtonDark
                        : isLiked
                          ? theme.profile.likedButton
                          : theme.profile.likeButton
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{post.likes}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Profile;