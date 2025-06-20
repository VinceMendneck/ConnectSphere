import { useState, useContext, useEffect } from 'react';
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
  const [error, setError] = useState<string[]>([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError([]);
  if (!username || !email || !password) {
    setError(['Todos os campos são obrigatórios']);
    toast.error('Todos os campos são obrigatórios');
    return;
  }
  if (password.length < 6) {
    setError(['A senha deve ter pelo menos 6 caracteres']);
    toast.error('A senha deve ter pelo menos 6 caracteres');
    return;
  }
  try {
    await register(username, email, password);
    navigate('/home'); // Redireciona para /home
    toast.success('Registro efetuado com sucesso!');
  } catch (err: unknown) {
    let errorMessage = 'Erro ao registrar';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    setError([errorMessage]);
    toast.error(errorMessage);
    console.error('Erro de registro:', err);
  }
};

  return (
    <div className={isDarkMode ? theme.auth.containerDark : theme.auth.container}>
      <h2 className={isDarkMode ? theme.auth.titleDark : theme.auth.title}>Registrar</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2 w-full max-w-md">
        {error.length > 0 && (
          <div className="text-red-500 text-sm">
            {error.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        )}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError([]);
          }}
          className={isDarkMode ? theme.auth.inputDark : theme.auth.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError([]);
          }}
          className={isDarkMode ? theme.auth.inputDark : theme.auth.input}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError([]);
          }}
          className={isDarkMode ? theme.auth.inputDark : theme.auth.input}
        />
        <button type="submit" className={isDarkMode ? theme.auth.buttonDark : theme.auth.button}>
          Registrar
        </button>
        <p className={isDarkMode ? theme.auth.noUserMessageDark : theme.auth.noUserMessage}>
          Já tem uma conta? <Link to="/login" className={theme.auth.link}>Faça login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;