// client/src/pages/Login.tsx
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';

function Login() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { login } = authContext;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains('dark-theme')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } else {
      toast.error('Preencha todos os campos!');
    }
  };

  return (
    <div className={isDarkMode ? theme.auth.containerDark : theme.auth.container}>
      <h2 className={isDarkMode ? theme.auth.titleDark : theme.auth.title}>Login</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={isDarkMode ? theme.auth.inputDark : theme.auth.input}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={isDarkMode ? theme.auth.inputDark : theme.auth.input}
        />
        <button type="submit" className={isDarkMode ? theme.auth.buttonDark : theme.auth.button}>
          Entrar
        </button>
      </form>
      <p className={isDarkMode ? theme.auth.noUserMessageDark : theme.auth.noUserMessage}>
        Não tem uma conta? <Link to="/register" className={theme.auth.link}>Registre-se</Link>
      </p>
    </div>
  );
}

export default Login;