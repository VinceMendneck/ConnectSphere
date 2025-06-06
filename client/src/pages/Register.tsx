// client/src/pages/Register.tsx
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';

function Register() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { register } = authContext;
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && email && password) {
      register(username, email, password);
      toast.success('Registro realizado com sucesso!');
      navigate('/login');
    } else {
      toast.error('Preencha todos os campos!');
    }
  };

  return (
    <div className={isDarkMode ? theme.auth.containerDark : theme.auth.container}>
      <h2 className={isDarkMode ? theme.auth.titleDark : theme.auth.title}>Registrar</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="text"
          placeholder="Nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={isDarkMode ? theme.auth.inputDark : theme.auth.input}
        />
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
          Registrar
        </button>
      </form>
      <p className={isDarkMode ? theme.auth.noUserMessageDark : theme.auth.noUserMessage}>
        Já tem uma conta? <Link to="/login" className={theme.auth.link}>Faça login</Link>
      </p>
    </div>
  );
}

export default Register;