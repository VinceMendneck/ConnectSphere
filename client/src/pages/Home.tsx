// client/src/pages/Home.tsx
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';
import type { Post } from '../types/index';

function Home() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { user, logout } = authContext;
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains('dark-theme')
  );
  const MAX_POST_LENGTH = 280;

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.remove('dark-theme');
      htmlElement.classList.add('light-theme');
    } else {
      htmlElement.classList.remove('light-theme');
      htmlElement.classList.add('dark-theme');
    }
    setIsDarkMode(!isDarkMode);
  };

  const handlePost = () => {
    if (!content.trim()) return;
    const newPost: Post = {
      id: posts.length + 1,
      content,
      createdAt: new Date().toISOString(),
      user: { id: user ? parseInt(user.username, 10) || 1 : 1, username: user?.username || 'Anônimo' },
    };
    setPosts([newPost, ...posts]);
    setContent('');
    toast.success('Post criado com sucesso!');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  return (
    <div className={isDarkMode ? theme.home.containerDark : theme.home.container}>
      <header className={theme.home.header}>
        <h1 className={isDarkMode ? theme.home.titleDark : theme.home.title}>ConnectSphere</h1>
        <div className="flex space-x-2">
          <button
            onClick={toggleTheme}
            className={isDarkMode ? theme.home.themeToggleButtonDark : theme.home.themeToggleButton}
          >
            {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          {user && (
            <button onClick={handleLogout} className={isDarkMode ? 'primary' : 'primary'}>
              Sair
            </button>
          )}
        </div>
      </header>
      {user ? (
        <div className={isDarkMode ? theme.home.postFormContainerDark : theme.home.postFormContainer}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_POST_LENGTH))}
            placeholder="No que você está pensando?"
            className={isDarkMode ? theme.home.textareaDark : theme.home.textarea}
          />
          <div className={theme.home.postFormFooter}>
            <span className={isDarkMode ? theme.home.charCountDark : theme.home.charCount}>
              {content.length}/{MAX_POST_LENGTH}
            </span>
            <button
              onClick={handlePost}
              className={isDarkMode ? theme.home.postButtonDark : theme.home.postButton}
              disabled={!content.trim()}
            >
              Postar
            </button>
          </div>
        </div>
      ) : (
        <p className={isDarkMode ? theme.home.noUserMessageDark : theme.home.noUserMessage}>
          Faça <Link to="/login" className={theme.home.link}>login</Link> ou{' '}
          <Link to="/register" className={theme.home.link}>registre-se</Link> para postar.
        </p>
      )}
      <div className={theme.home.postList}>
        {posts.length === 0 ? (
          <p className={isDarkMode ? theme.home.emptyPostMessageDark : theme.home.emptyPostMessage}>
            Nenhum post disponível.
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={isDarkMode ? theme.home.postContainerDark : theme.home.postContainer}
            >
              <p className={isDarkMode ? theme.home.postContentDark : theme.home.postContent}>
                {post.content}
              </p>
              <div className={isDarkMode ? theme.home.postMetaDark : theme.home.postMeta}>
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

export default Home;