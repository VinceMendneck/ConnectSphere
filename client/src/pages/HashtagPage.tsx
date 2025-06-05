// client/src/pages/HashtagPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/mockApi';
import { theme } from '../styles/theme';
import { type Post } from '../types';

function HashtagPage() {
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get(`/hashtags/${tag}/posts`);
        setPosts(res.data);
      } catch (_) {
        toast.error('Erro ao carregar posts');
      }
    };
    if (tag) {
      fetchPosts();
    }
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
    <div className={theme.hashtag.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className={theme.hashtag.title}>Posts com #{tag}</h2>
      <div className={theme.hashtag.postList}>
        {posts.length === 0 ? (
          <p className={theme.hashtag.emptyPostMessage}>Nenhum post encontrado para #{tag}.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={theme.hashtag.postContainer}>
              <p className={theme.hashtag.postContent}>{renderContent(post.content)}</p>
              <p className={theme.hashtag.postMeta}>
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