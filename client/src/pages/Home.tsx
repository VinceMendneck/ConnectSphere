// client/src/pages/Home.tsx
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContextType';
import { PostContext } from '../context/PostContextType';
import { theme } from '../styles/theme';
import { renderHashtags } from '../utils/renderHashtags';

function Home() {
  const authContext = useContext(AuthContext);
  const postContext = useContext(PostContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  if (!postContext) {
    throw new Error('PostContext must be used within a PostProvider');
  }
  const { user, logout } = authContext;
  const { posts, addPost, toggleLike } = postContext;
  const navigate = useNavigate();
  const [content, setContent] = useState('');
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

  const handlePost = async () => {
    if (!content.trim()) return;
    if (!user) {
      toast.error('Faça login para postar!');
      return;
    }
    try {
      await addPost(content);
      setContent('');
      toast.success('Post criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar post');
    }
  };

  const handleLike = async (postId: number) => {
    if (!user) {
      toast.error('Faça login para curtir!');
      return;
    }
    try {
      await toggleLike(postId);
    } catch (error) {
      toast.error('Erro ao curtir/descurtir post');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout efetuado com sucesso!');
    navigate('/');
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
            <span className="flex items-center space-x-1">
              {isDarkMode ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2v2m0 16v2m10-10h-2m-16 0H2m16.364-6.364l-1.414 1.414M5.636 18.364l-1.414 1.414m13.142 0l-1.414-1.414M5.636 5.636l-1.414-1.414M12 6a6 6 0 100 12 6 6 0 000-12z" />
                  </svg>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </>
              )}
            </span>
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
          Faça <Link to="/login" className={theme.auth.link}>login</Link> ou{' '}
          <Link to="/register" className={theme.auth.link}>registre-se</Link> para postar.
        </p>
      )}
      <div className={theme.home.postList}>
        {posts.length === 0 ? (
          <p className={isDarkMode ? theme.home.emptyPostMessageDark : theme.home.emptyPostMessage}>
            Nenhum post disponível.
          </p>
        ) : (
          posts.map((post) => {
            const isLiked = user && post.likedBy.includes(user.id);
            return (
              <div
                key={post.id}
                className={isDarkMode ? theme.home.postContainerDark : theme.home.postContainer}
              >
                <p className={isDarkMode ? theme.home.postContentDark : theme.home.postContent}>
                  {renderHashtags(post.content)}
                </p>
                <div className={isDarkMode ? theme.home.postMetaDark : theme.home.postMeta}>
                  <span>Por {post.user.username}</span> ·{' '}
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                  <button
                    onClick={() => handleLike(post.id)}
                    className={
                      isDarkMode
                        ? isLiked
                          ? theme.home.likedButtonDark
                          : theme.home.likeButtonDark
                        : isLiked
                          ? theme.home.likedButton
                          : theme.home.likeButton
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{post.likes}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Home;