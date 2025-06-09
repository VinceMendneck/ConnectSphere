// client/src/context/AuthContext.tsx
import { type ReactNode, useState } from 'react';
import { AuthContext, type User } from './AuthContextType';
import api from '../services/api';
import { toast } from 'react-toastify';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, userId } = response.data;
      localStorage.setItem('token', token);
      const userData = await api.get(`/api/users/${userId}`);
      setUser(userData.data);
      toast.success('Login efetuado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao fazer login');
      throw new Error('Email ou senha inválidos');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    console.log('Logout efetuado');
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/register', { username, email, password });
      setUser(response.data);
      toast.success('Registro efetuado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao registrar');
      throw new Error('Erro ao registrar usuário');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}