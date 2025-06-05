// client/src/components/Sidebar.tsx
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';

function Sidebar() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { user } = authContext;

  return (
    <div className={theme.sidebar.container}>
      <h2 className={theme.sidebar.logo}>ConnectSphere</h2>
      <nav className={theme.sidebar.nav}>
        <Link to="/" className={theme.sidebar.link}>
          Home
        </Link>
        <Link to="/hashtag/tecnologia" className={theme.sidebar.link}>
          Hashtags
        </Link>
        {user && (
          <Link to="/profile" className={theme.sidebar.link}>
            Perfil
          </Link>
        )}
        {!user && (
          <Link to="/login" className={theme.sidebar.link}>
            Entrar
          </Link>
        )}
      </nav>
    </div>
  );
}

export default Sidebar;