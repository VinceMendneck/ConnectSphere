import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { theme } from '../styles/theme';
import api from '../services/api';
import { type Post } from '../types/index';

function HashtagPage() {
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [userAvatars, setUserAvatars] = useState<Record<number, string>>({});

  const DEFAULT_AVATAR = 'http://localhost:5000/uploads/default-avatar.png';

  // Função para buscar o avatar de um usuário

  const fetchUserAvatar = useCallback(
    async (userId: number) => {
      if (userAvatars[userId]) return; // Evita requisições redundantes
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
      }
    },
    [userAvatars, DEFAULT_AVATAR]
  );

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/posts/hashtag/${tag}`);
        console.log('Resposta da API para hashtag - raw data:', response.data);
        if (Array.isArray(response.data)) {
          setPosts(response.data);
          // Busca avatares dos usuários dos posts
          response.data.forEach((post: Post) => fetchUserAvatar(post.user.id));
        } else {
          console.warn('Resposta da API não é um array:', response.data);
          setPosts([]);
        }
      } catch (error) {
        console.error('Erro ao buscar posts por hashtag:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [tag, fetchUserAvatar]);

  if (loading) {
    return (
      <div className={isDarkMode ? theme.hashtag.containerDark : theme.hashtag.container}>
        <p className={isDarkMode ? theme.hashtag.emptyPostMessageDark : theme.hashtag.emptyPostMessage}>
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? theme.hashtag.containerDark : theme.hashtag.container}>
      <h2 className={isDarkMode ? theme.hashtag.titleDark : theme.hashtag.title}>Posts com #{tag}</h2>
      <div className={theme.hashtag.postList}>
        {posts.length === 0 ? (
          <p
            className={isDarkMode ? theme.hashtag.emptyPostMessageDark : theme.hashtag.emptyPostMessage}
          >
            Nenhum post encontrado com #{tag}.
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={isDarkMode ? theme.hashtag.postContainerDark : theme.hashtag.postContainer}
            >
              <p className={isDarkMode ? theme.hashtag.postContentDark : theme.hashtag.postContent}>
                {post.content}
              </p>
              {post.images && post.images.length > 0 && (
                <div className="max-w-[320px] w-full mt-2 p-1 ml-0">
                  <div className="grid grid-cols-2 gap-2">
                    {post.images.map((image, index) => {
                      console.log(`Rendering image ${index + 1}: ${image}`);
                      return (
                        <div key={index} className="relative w-[150px] h-[150px]">
                          <img
                            src={image}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                            onError={() => console.log('Erro ao carregar imagem:', image)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className={isDarkMode ? theme.hashtag.postMetaDark : theme.hashtag.postMeta}>
                <div className="flex items-center">
                  <img
                    src={userAvatars[post.user.id] || DEFAULT_AVATAR}
                    alt={`${post.user.username} avatar`}
                    className="w-8 h-8 rounded-full object-cover mr-2"
                    onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
                  />
                  <Link to={`/profile/${post.user.id}`} className={theme.hashtag.link}>
                    @{post.user.username}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HashtagPage;