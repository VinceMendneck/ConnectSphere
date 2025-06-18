import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { PostContext } from '../context/PostContextType';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import PostList from '../components/posts/PostList';
import useDarkMode from '../hooks/useDarkMode';
import usePosts from '../hooks/usePosts';

function HashtagPage() {
  const { tag } = useParams<{ tag: string }>();
  const postContext = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!postContext || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const isDarkMode = useDarkMode();
  const { posts, loadingPosts, loadingAvatars, error, userAvatars, fetchUserAvatar } = usePosts({ hashtag: tag });

  if (loadingPosts || loadingAvatars) {
    return <LoadingSkeleton isDarkMode={isDarkMode} />;
  }

  return (
    <div className={isDarkMode ? theme.hashtag.containerDark : theme.hashtag.container}>
      <h2 className={isDarkMode ? theme.home.titleDark : theme.home.title}>Posts com #{tag}</h2>
      {error ? (
        <ErrorMessage errors={error} isDarkMode={isDarkMode} />
      ) : (
        <PostList
          posts={posts}
          isDarkMode={isDarkMode}
          userAvatars={userAvatars}
          fetchUserAvatar={fetchUserAvatar}
          emptyMessage={`Nenhum post encontrado com #${tag}.`}
        />
      )}
    </div>
  );
}

export default HashtagPage;