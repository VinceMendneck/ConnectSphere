// client/src/pages/Home.tsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';
import type { Post } from '../types';

function Home() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { user } = authContext;
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Carrega posts na inicialização
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get<Post[]>('http://localhost:3000/posts');
        setPosts(res.data);
      } catch (_) { // Substitui 'error' por '_'
        toast.error('Erro ao carregar posts');
      }
    };
    fetchPosts();
  }, []);

  // Função para criar um novo post
  const handlePost = async () => {
    if (!content.trim()) {
      toast.error('O post não pode estar vazio');
      return;
    }
    if (content.length > 280) {
      toast.error('O post deve ter no máximo 280 caracteres');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/posts',
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent('');
      toast.success('Post criado com sucesso!');
      const res = await axios.get<Post[]>('http://localhost:3000/posts');
      setPosts(res.data);
    } catch (_) { // Substitui 'error' por '_'
      toast.error('Erro ao criar post');
    }
  };

  // Função para alternar tema claro/escuro
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Função para renderizar hashtags clicáveis
  const renderContent = (text: string) => {
    const parts = text.split(/(\\#[\w]+)/);
    return parts.map((part, index) =>
      part.startsWith('#') ? (
        <Link
          key={index}
          to={`/hashtag/${part.slice(1)}`}
          className={theme.home.hashtagLink}
        >
          {part}
        </Link>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className={theme.home.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={theme.home.header}>
        <h1 className={theme.home.title}>ConnectSphere</h1>
        <button onClick={toggleTheme} className={theme.home.themeToggleButton}>
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>
      {user ? (
        <div className={theme.home.postFormContainer}>
          <textarea
            className={theme.home.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="No que você está pensando?"
            maxLength={280}
            rows={4}
          />
          <div className={theme.home.postFormFooter}>
            <span className={theme.home.charCount}>
              {content.length}/280
            </span>
            <button
              onClick={handlePost}
              className={theme.home.postButton}
              disabled={!content.trim()}
            >
              Postar
            </button>
          </div>
        </div>
      ) : (
        <p className={theme.home.noUserMessage}>
          Faça <Link to="/login" className={theme.home.link}>login</Link> para postar.
        </p>
      )}
      <div className={theme.home.postList}>
        {posts.length === 0 ? (
          <p className={theme.home.emptyPostMessage}>Nenhum post disponível.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={theme.home.postContainer}>
              <p className={theme.home.postContent}>{renderContent(post.content)}</p>
              <p className={theme.home.postMeta}>
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

export default Home;