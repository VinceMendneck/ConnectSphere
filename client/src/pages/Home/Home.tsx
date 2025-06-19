import { useContext } from 'react';
import { PostContext } from '../../context/PostContextType';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from './theme';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import PostForm from '../../components/posts/PostForm';
import PostList from '../../components/posts/PostList';
import useDarkMode from '../../hooks/useDarkMode';
import usePosts from '../../hooks/usePosts';

function Home() {
  const postContext = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!postContext || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const isDarkMode = useDarkMode();
  const { posts, loadingPosts, loadingAvatars, userAvatars, fetchUserAvatar } = usePosts();

  if (loadingPosts || loadingAvatars) {
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