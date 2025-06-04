// client/src/pages/Register.tsx
import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Corrigido: Adicionei Link
import { toast } from 'react-toastify';
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

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Email inválido');
      return;
    }

    try {
      await register(email, password, username);
      toast.success('Registro realizado com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (_) {
      toast.error('Erro ao registrar. Tente novamente.');
    }
  };

  return (
    <div className={theme.auth.container}>
      <h2 className={theme.auth.title}>Registrar</h2>
      <input
        className={theme.auth.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <input
        className={theme.auth.input}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Nome de usuário"
        type="text"
      />
      <input
        className={theme.auth.input}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <button onClick={handleSubmit} className={theme.auth.button}>
        Registrar
      </button>
      <p className={theme.auth.noUserMessage}>
        Já tem uma conta? <Link to="/login" className={theme.auth.link}>Faça login</Link>
      </p>
    </div>
  );
}

export default Register;