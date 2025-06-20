import { useContext, useState, useEffect } from 'react';
import { PostContext } from '../../context/PostContextType';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from './theme';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import PostForm from '../../components/posts/PostForm';
import PostList from '../../components/posts/PostList';
import useDarkMode from '../../hooks/useDarkMode';
import api from '../../services/api';

function Home() {
  const postContext = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!postContext || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { posts } = postContext;
  const { isLoading: authLoading } = authContext;
  console.log('Home renderizado com posts:', posts);

  useEffect(() => {
    console.log('Home: posts atualizados:', posts);
  }, [posts]);

  const isDarkMode = useDarkMode();
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [userAvatars, setUserAvatars] = useState<Record<number, string>>({});

  const fetchUserAvatar = async (userId: number) => {
    try {
      setLoadingAvatars(true);
      const response = await api.get(`/api/users/${userId}/avatar`);
      setUserAvatars((prev) => ({ ...prev, [userId]: response.data.avatar }));
    } catch (error) {
      console.error('Erro ao buscar avatar:', error);
    } finally {
      setLoadingAvatars(false);
    }
  };

  if (authLoading || loadingAvatars) {
    return <LoadingSkeleton isDarkMode={isDarkMode} />;
  }

  return (
    <div className={isDarkMode ? theme.home.containerDark : theme.home.container}>
      <div className={isDarkMode ? theme.home.header : theme.home.header}>
        <h1 className={isDarkMode ? theme.home.titleDark : theme.home.title}>ConnectSphere</h1>
      </div>
      <PostForm isDarkMode={isDarkMode} />
      <PostList
        posts={posts}
        isDarkMode={isDarkMode}
        userAvatars={userAvatars}
        fetchUserAvatar={fetchUserAvatar}
      />
    </div>
  );
}

export default Home;