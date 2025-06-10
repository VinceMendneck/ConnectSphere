import { useState, useEffect, useContext } from 'react';
import { PostContext } from '../context/PostContextType';
import { theme } from '../styles/theme';
import { Link } from 'react-router-dom';

// Função para detectar hashtags
const extractHashtags = (text: string) => {
  return text.match(/#\w+/g) || [];
};

function Home() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('PostContext must be used within a PostProvider');
  }
  const { posts, addPost, toggleLike } = context;
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) {
      return;
    }
    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);
    try {
      await addPost(formData);
      setContent('');
      setImage(null);
    } catch (error) {
      console.error('Erro ao criar post:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    document.documentElement.classList.toggle('dark-theme', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    setIsDarkMode(newTheme);
  };

  return (
    <div className={isDarkMode ? theme.home.containerDark : theme.home.container}>
      <div className={isDarkMode ? theme.home.header : theme.home.header}>
        <h1 className={isDarkMode ? theme.home.titleDark : theme.home.title}>ConnectSphere</h1>
        <button
          onClick={toggleTheme}
          className={isDarkMode ? theme.home.themeToggleButtonDark : theme.home.themeToggleButton}
        >
          {isDarkMode ? (
            <svg
              className="h-6 w-6 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
      <div className={isDarkMode ? theme.home.postFormContainerDark : theme.home.postFormContainer}>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={isDarkMode ? theme.home.textareaDark : theme.home.textarea}
            placeholder="O que está acontecendo?"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            className={isDarkMode ? theme.home.textareaDark : theme.home.textarea}
          />
          <div className={theme.home.postFormFooter}>
            <span className={isDarkMode ? theme.home.charCountDark : theme.home.charCount}>
              {280 - content.length} caracteres restantes
            </span>
            <button type="submit" className={isDarkMode ? theme.home.postButtonDark : theme.home.postButton}>
              Postar
            </button>
          </div>
        </form>
      </div>
      {posts.length === 0 ? (
        <p className={isDarkMode ? theme.home.emptyPostMessageDark : theme.home.emptyPostMessage}>
          Nenhum post para exibir.
        </p>
      ) : (
        <div className={theme.home.postList}>
          {posts.map((post) => (
            <div key={post.id} className={isDarkMode ? theme.home.postContainerDark : theme.home.postContainer}>
              <p className={isDarkMode ? theme.home.postContentDark : theme.home.postContent}>
                {extractHashtags(post.content).length > 0
                  ? extractHashtags(post.content).map((hashtag, index) => (
                      <Link key={index} to={`/hashtag/${hashtag.slice(1)}`} className={theme.home.hashtagLink}>
                        {hashtag}{' '}
                      </Link>
                    ))
                  : post.content}
              </p>
              {post.image && <img src={`http://localhost:5000/${post.image}`} alt="Post image" className="w-32 h-32 mt-2" />}
              <div className={isDarkMode ? theme.home.postMetaDark : theme.home.postMeta}>
                <Link to={`/profile/${post.user.id}`} className={theme.home.hashtagLink}>
                  @{post.user.username}
                </Link>
                <button
                  onClick={() => toggleLike(post.id)}
                  className={post.likedBy?.includes(parseInt(localStorage.getItem('userId') || '0'))
                    ? isDarkMode ? theme.home.likedButtonDark : theme.home.likedButton
                    : isDarkMode ? theme.home.likeButtonDark : theme.home.likeButton}
                >
                  ❤️ {post.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;