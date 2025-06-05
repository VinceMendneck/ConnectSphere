// client/src/pages/Home.tsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Adiciona useNavigate
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContextType'; // Corrige para AuthContext
import { theme } from '../styles/theme';
import { type Post } from '../types';
import api from '../services/mockApi';

function Home() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { user, logout } = authContext;
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const navigate = useNavigate(); // Define navigate

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts');
        setPosts(res.data);
      } catch (error) {
        toast.error('Erro ao carregar posts');
        console.error('Fetch posts error:', error);
      }
    };
    fetchPosts();

    // Sincroniza tema inicial
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.border = '2px solid red'; // Depuração
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.border = '2px solid green'; // Depuração
    }

    return () => {
      document.documentElement.style.border = ''; // Limpa depuração
    };
  }, [darkMode]);

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
      await api.post('/posts', { content });
      setContent('');
      toast.success('Post criado com sucesso!');
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (error) {
      toast.error('Erro ao criar post');
      console.error('Post error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      console.log('Tema alterado:', newMode ? 'Escuro (cinza)' : 'Claro (branco)');
      return newMode;
    });
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(#[\w]+)/);
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
        <div className="flex space-x-2">
          <button onClick={toggleTheme} className={theme.home.themeToggleButton}>
            {darkMode ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          {user && (
            <button onClick={handleLogout} className={theme.home.themeToggleButton}>
              Sair
            </button>
          )}
        </div>
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