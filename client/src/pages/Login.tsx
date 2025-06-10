import { useState, useContext, useEffect } from 'react';
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
  const [error, setError] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
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
    if (!email || !password) {
      setError(['Email e senha são obrigatórios']);
      toast.error('Email e senha são obrigatórios');
      return;
    }
    try {
      await login(email, password);
      navigate('/');
      toast.success('Login efetuado com sucesso!');
    } catch (err: unknown) {
      let errorMessage = 'Erro ao fazer login';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError([errorMessage]);
      toast.error(errorMessage);
      console.error('Erro de login:', err);
    }
  };

  return (
    <div className={isDarkMode ? theme.auth.containerDark : theme.auth.container}>
      <h2 className={isDarkMode ? theme.auth.titleDark : theme.auth.title}>Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2 w-full max-w-md">
        {error.length > 0 && (
          <div className="text-red-500 text-sm">
            {error.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        )}
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
        <div className="relative flex items-center">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError([]);
            }}
            className={isDarkMode ? theme.auth.inputDark : theme.auth.input}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 flex items-center justify-center h-full py-2.5 pr-2.5 mb-2.5"
            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        <button type="submit" className={isDarkMode ? theme.auth.buttonDark : theme.auth.button}>
          Entrar
        </button>
        <p className={isDarkMode ? theme.auth.noUserMessageDark : theme.auth.noUserMessage}>
          Não tem uma conta? <Link to="/register" className={theme.auth.link}>Registre-se</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;