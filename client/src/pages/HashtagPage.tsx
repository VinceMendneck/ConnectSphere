// client/src/pages/HashtagPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { theme } from '../styles/theme';
import { type Post } from '../types';
import api from '../services/mockApi';

function HashtagPage() {
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const isDarkMode = document.documentElement.classList.contains('dark-theme');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get(`/posts?hashtag=${tag}`);
        setPosts(res.data);
      } catch (error) {
        toast.error('Erro ao carregar posts');
        console.error('Fetch hashtag posts error:', error);
      }
    };
    fetchPosts();
  }, [tag]);

  const renderContent = (text: string) => {
    const parts = text.split(/(#[\w]+)/);
    return parts.map((part, index) =>
      part.startsWith('#') ? (
        <Link
          key={index}
          to={`/hashtag/${part.slice(1)}`}
          className={theme.hashtag.link}
        >
          {part}
        </Link>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className={isDarkMode ? theme.hashtag.containerDark : theme.hashtag.container}>
      <h2 className={isDarkMode ? theme.hashtag.titleDark : theme.hashtag.title}>#{tag}</h2>
      <div className={theme.hashtag.postList}>
        {posts.length === 0 ? (
          <p className={isDarkMode ? theme.hashtag.emptyPostMessageDark : theme.hashtag.emptyPostMessage}>
            Nenhum post encontrado para #{tag}.
          </p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={isDarkMode ? theme.hashtag.postContainerDark : theme.hashtag.postContainer}>
              <p className={isDarkMode ? theme.hashtag.postContentDark : theme.hashtag.postContent}>{renderContent(post.content)}</p>
              <p className={isDarkMode ? theme.hashtag.postMetaDark : theme.hashtag.postMeta}>
                Por {post.user?.username || 'Anônimo'} em{' '}
                {new Date(post.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HashtagPage;