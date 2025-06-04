// client/src/pages/Login.tsx
import { useContext, useState } from 'react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Email inválido');
      return;
    }

    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (_) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className={theme.auth.container}>
      <h2 className={theme.auth.title}>Login</h2>
      <input
        className={theme.auth.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <input
        className={theme.auth.input}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <button onClick={handleSubmit} className={theme.auth.button}>
        Entrar
      </button>
      <p className={theme.auth.noUserMessage}>
        Não tem uma conta? <Link to="/register" className={theme.auth.link}>Registre-se</Link>
      </p>
    </div>
  );
}

export default Login;