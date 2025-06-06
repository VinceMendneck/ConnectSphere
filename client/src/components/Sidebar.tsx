// client/src/components/Sidebar.tsx
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
    document.documentElement.classList.contains('dark-theme')
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

  return (
    <div className={isDarkMode ? theme.sidebar.containerDark : theme.sidebar.container}>
      <h2 className={isDarkMode ? theme.sidebar.logoDark : theme.sidebar.logo}>ConnectSphere</h2>
      <nav className={theme.sidebar.nav}>
        <Link to="/" className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}>
          Home
        </Link>
        {user ? (
          <>
            <Link to="/profile" className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}>
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
            <Link to="/login" className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}>
              Login
            </Link>
            <Link to="/register" className={isDarkMode ? theme.sidebar.linkDark : theme.sidebar.link}>
              Registrar
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}

export default Sidebar;