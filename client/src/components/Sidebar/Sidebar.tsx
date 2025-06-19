import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContextType';
import { theme } from './theme';
import { toast } from 'react-toastify';
import useDarkMode from '../../hooks/useDarkMode';

function Sidebar() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { user, logout } = authContext;
  const isDarkMode = useDarkMode();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sincroniza as classes de tema no carregamento inicial
  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', isDarkMode);
    document.documentElement.classList.toggle('light-theme', !isDarkMode);
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    document.documentElement.classList.toggle('dark-theme', newTheme);
    document.documentElement.classList.toggle('light-theme', !newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Mobile Navbar */}
      <div className={`${isDarkMode ? theme.sidebar.mobileContainerDark : theme.sidebar.mobileContainer} lg:hidden flex items-center justify-center relative !fixed !z-50`}>
        <button
          onClick={toggleMenu}
          className={`${isDarkMode ? theme.sidebar.hamburgerButtonDark : theme.sidebar.hamburgerButton} absolute left-4`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h2 className={`${isDarkMode ? theme.sidebar.logoDark : theme.sidebar.logo} ${theme.sidebar.logoCentered}`}>ConnectSphere</h2>
        <button
          onClick={toggleTheme}
          className={`${isDarkMode ? theme.sidebar.themeToggleButtonDark : theme.sidebar.themeToggleButton} absolute right-4`}
        >
          {isDarkMode ? (
            <svg
              className="h-5 w-5 text-yellow-500 hover:text-[#fde458]"
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
              className="h-5 w-5 text-gray-800 hover:text-[#4591d6]"
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className={isDarkMode ? theme.sidebar.mobileMenuDark : theme.sidebar.mobileMenu}>
          <Link
            to="/"
            className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                to={`/profile/${user.id}`}
                className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}
                onClick={() => setIsMenuOpen(false)}
              >
                Perfil
              </Link>
              <button
                className={isDarkMode ? theme.sidebar.buttonDark : theme.sidebar.button}
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}
                onClick={() => setIsMenuOpen(false)}
              >
                Registrar
              </Link>
            </>
          )}
        </nav>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0">
        <div className={isDarkMode ? theme.sidebar.containerDark : theme.sidebar.container}>
          <div className="flex items-start justify-between mb-2">
            <h2 className={isDarkMode ? theme.sidebar.logoDark : theme.sidebar.logo}>ConnectSphere</h2>
            <button
              onClick={toggleTheme}
              className={isDarkMode ? theme.sidebar.themeToggleButtonDark : theme.sidebar.themeToggleButton}
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
                  className="h-5 w-5 text-gray-800 hover:text-[#4591d6] -mt-0.25 -ml-0.5"
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
              className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to={`/profile/${user.id}`}
                  className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}
                >
                  Perfil
                </Link>
                <button
                  className={isDarkMode ? theme.sidebar.buttonDark : theme.sidebar.button}
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Sidebar;