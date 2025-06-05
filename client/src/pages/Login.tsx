// client/src/pages/Login.tsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';

function Login() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { login } = authContext;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao fazer login');
      console.error('Erro de login:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white dark:bg-[#1a202c] min-h-screen flex flex-col items-center justify-center">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className={theme.auth.title}>Entrar no ConnectSphere</h2>
      <form onSubmit={handleLogin} className="w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={theme.auth.input}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={theme.auth.input}
        />
        <button type="submit" className={theme.auth.button}>
          Entrar
        </button>
      </form>
      <p className={theme.auth.noUserMessage}>
        Não tem uma conta?{' '}
        <Link to="/register" className={theme.auth.link}>
          Registre-se
        </Link>
      </p>
    </div>
  );
}

export default Login;