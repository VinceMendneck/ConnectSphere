// client/src/pages/Register.tsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContextType';
import { theme } from '../styles/theme';

function Register() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { register } = authContext;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !username.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await register(email, password, username);
      toast.success('Registro realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao registrar');
      console.error('Erro de registro:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white dark:bg-[#1a202c] min-h-screen flex flex-col items-center justify-center">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className={theme.auth.title}>Registrar no ConnectSphere</h2>
      <form onSubmit={handleRegister} className="w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={theme.auth.input}
        />
        <input
          type="text"
          placeholder="Nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          Registrar
        </button>
      </form>
      <p className={theme.auth.noUserMessage}>
        Já tem uma conta?{' '}
        <Link to="/login" className={theme.auth.link}>
          Entre
        </Link>
      </p>
    </div>
  );
}

export default Register;