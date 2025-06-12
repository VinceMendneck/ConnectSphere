import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';
import { toast } from 'react-toastify';

function Sidebar() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { user, logout } = authContext;
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')
  );
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    document.documentElement.classList.toggle('dark-theme', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    setIsDarkMode(newTheme);
  };

  return (
    <div className={isDarkMode ? theme.sidebar.containerDark : theme.sidebar.container}>
      <div className="flex items-start justify-between mb-2">
        <h2 className={isDarkMode ? theme.sidebar.logoDark : theme.sidebar.logo}>ConnectSphere</h2>
        <button
          onClick={toggleTheme}
          className={isDarkMode ? theme.home.themeToggleButtonDark : theme.home.themeToggleButton}
        >
          {isDarkMode ? (
            <svg
              className="h-5 w-5 text-yellow-500 hover:text-[#fde458] -mr-0.5"
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
              className="h-5 w-5 text-gray-800 hover:text-[#4b5569] -mt-0.25 -ml-0.5"
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
      <nav className={theme.sidebar.nav}>
        <Link
          to="/"
          style={{
            background: 'transparent',
            color: isDarkMode ? '#e2e8f0' : '#213547',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = isDarkMode ? '#60a5fa' : '#3b82f6')}
          onMouseLeave={(e) => (e.currentTarget.style.color = isDarkMode ? '#e2e8f0' : '#213547')}
        >
          Home
        </Link>
        {user ? (
          <>
            <Link
              to={`/profile/${user.id}`}
              style={{
                background: 'transparent',
                color: isDarkMode ? '#e2e8f0' : '#213547',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = isDarkMode ? '#60a5fa' : '#3b82f6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDarkMode ? '#e2e8f0' : '#213547')}
            >
              Perfil
            </Link>
            <button
              style={{
                background: 'transparent',
                color: isDarkMode ? '#e2e8f0' : '#213547',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                textAlign: 'left',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = isDarkMode ? '#60a5fa' : '#3b82f6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDarkMode ? '#e2e8f0' : '#213547')}
              onClick={handleLogout}
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                background: 'transparent',
                color: isDarkMode ? '#e2e8f0' : '#213547',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = isDarkMode ? '#60a5fa' : '#3b82f6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDarkMode ? '#e2e8f0' : '#213547')}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                background: 'transparent',
                color: isDarkMode ? '#e2e8f0' : '#213547',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = isDarkMode ? '#60a5fa' : '#3b82f6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDarkMode ? '#e2e8f0' : '#213547')}
            >
              Registrar
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}

export default Sidebar;