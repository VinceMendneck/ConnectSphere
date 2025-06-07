// client/src/pages/HashtagPage.tsx
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PostContext } from '../context/PostContextType';
import { theme } from '../styles/theme';
import { type Post } from '../types/index';
import { renderHashtags } from '../utils/renderHashtags';

function HashtagPage() {
  const { id } = useParams<{ id: string }>();
  const tag = id;
  const postContext = useContext(PostContext);
  if (!postContext) {
    throw new Error('PostContext must be used within a PostProvider');
  }
  const { posts } = postContext;
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains('dark-theme')
  );

  useEffect(() => {
    const filtered = posts.filter((post) =>
      post.content.toLowerCase().includes(`#${tag?.toLowerCase()}`)
    );
    setFilteredPosts(filtered);
  }, [tag, posts]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={isDarkMode ? theme.hashtag.containerDark : theme.hashtag.container}>
      <h2 className={isDarkMode ? theme.hashtag.titleDark : theme.hashtag.title}>
        Posts com #{tag}
      </h2>
      <div className={theme.hashtag.postList}>
        {filteredPosts.length === 0 ? (
          <p
            className={isDarkMode ? theme.hashtag.emptyPostMessageDark : theme.hashtag.emptyPostMessage}
          >
            Nenhum post encontrado com #{tag}.
          </p>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={isDarkMode ? theme.hashtag.postContainerDark : theme.hashtag.postContainer}
            >
              <p className={isDarkMode ? theme.hashtag.postContentDark : theme.hashtag.postContent}>
                {renderHashtags(post.content)}
              </p>
              <div className={isDarkMode ? theme.hashtag.postMetaDark : theme.hashtag.postMeta}>
                <span>Por {post.user.username}</span> ·{' '}
                <span>{new Date(post.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HashtagPage;