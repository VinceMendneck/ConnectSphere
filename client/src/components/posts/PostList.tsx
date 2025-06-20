import { theme } from '../../styles/theme';
import { type Post } from '../../types/index';
import PostItem from './PostItem';
import { useEffect } from 'react';

interface PostListProps {
  posts: Post[];
  isDarkMode: boolean;
  userAvatars: Record<number, string>;
  fetchUserAvatar: (userId: number) => Promise<void>;
  emptyMessage?: string;
}

function PostList({ posts, isDarkMode, userAvatars, fetchUserAvatar, emptyMessage = 'Nenhum post para exibir.' }: PostListProps) {
  console.log('PostList renderizado com posts:', posts);

  useEffect(() => {
    console.log('PostList montado ou posts atualizados:', posts);
  }, [posts]);

  return (
    <div className={theme.home.postList}>
      {posts.length === 0 ? (
        <p className={isDarkMode ? theme.home.emptyPostMessageDark : theme.home.emptyPostMessage}>
          {emptyMessage}
        </p>
      ) : (
        posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            isDarkMode={isDarkMode}
            userAvatars={userAvatars}
            fetchUserAvatar={fetchUserAvatar}
          />
        ))
      )}
    </div>
  );
}

export default PostList;