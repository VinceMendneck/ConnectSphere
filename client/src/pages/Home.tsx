import { useState, useEffect, useContext, useRef } from 'react';
import { PostContext } from '../context/PostContextType';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';
import { Link } from 'react-router-dom';

// Função para detectar hashtags
const extractHashtags = (text: string) => {
  return text.match(/#\w+/g) || [];
};

function Home() {
  const context = useContext(PostContext);
  const authContext = useContext(AuthContext);
  if (!context || !authContext) {
    throw new Error('PostContext or AuthContext must be used within their respective Providers');
  }
  const { posts, addPost, toggleLike } = context;
  const { user } = authContext;
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')
  );
  const userId = user ? user.id : 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (fileInputRef.current) fileInputRef.current.value = ''; // Limpar input
    } catch (error) {
      console.error('Erro ao criar post:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
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
          <div className={`${theme.home.postFormFooter} flex items-center justify-between`}>
            <span className={isDarkMode ? theme.home.charCountDark : theme.home.charCount}>
              {280 - content.length} caracteres restantes
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className={theme.home.imageUploadButton}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" fill="none" />
                  <path
                    d="M5 7h14M5 12h7m-7 5h14"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </label>
              <button type="submit" className={isDarkMode ? theme.home.postButtonDark : theme.home.postButton}>
                Postar
              </button>
            </div>
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
                  ? post.content.split(' ').map((word, index) =>
                      extractHashtags(word).length > 0 ? (
                        <Link key={index} to={`/hashtag/${word.slice(1)}`} className={theme.home.hashtagLink}>
                          {word}{' '}
                        </Link>
                      ) : (
                        <span key={index}>{word} </span>
                      )
                    )
                  : post.content}
              </p>
              {post.image && <img src={`http://localhost:5000/${post.image}`} alt="Post image" className="w-32 h-32 mt-2" />}
              <div className={isDarkMode ? theme.home.postMetaDark : theme.home.postMeta}>
                <Link to={`/profile/${post.user.id}`} className={theme.home.hashtagLink}>
                  @{post.user.username}
                </Link>
                <button
                  onClick={async () => {
                    if (!user) {
                      console.log('Usuário não autenticado, login necessário. userId:', userId, 'user:', user);
                      return;
                    }
                    try {
                      await toggleLike(post.id);
                      console.log('Post after like - userId:', userId, 'likedBy:', post.likedBy);
                    } catch (error) {
                      console.error('Erro ao curtir/descurtir:', error);
                    }
                  }}
                  className={post.likedBy?.includes(userId)
                    ? isDarkMode ? theme.home.likedButtonDark : theme.home.likedButton
                    : isDarkMode ? theme.home.likeButtonDark : theme.home.likeButton}
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill={post.likedBy?.includes(userId) ? '#ff0000' : 'none'}
                    stroke={post.likedBy?.includes(userId) ? 'none' : 'currentColor'}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {post.likes}
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