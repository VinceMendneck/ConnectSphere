import { type ReactNode, useState } from 'react';
import { AuthContext, type User } from './AuthContextType';
import api from '../services/api';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface ApiError {
  error: { message: string }[] | string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentando login com:', { email, password });
      const response = await api.post('/api/auth/login', { email, password });
      const { token, userId } = response.data;
      localStorage.setItem('token', token);
      const userResponse = await api.get(`/api/users/${userId}`);
      setUser(userResponse.data);
      console.log('Login bem-sucedido:', userResponse.data);
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Erro de login:', axiosError.response?.data || axiosError.message);
      const errorMsg = Array.isArray(axiosError.response?.data?.error)
        ? axiosError.response.data.error.map(e => e.message).join(', ')
        : axiosError.response?.data?.error || 'Email ou senha inválidos';
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    console.log('Logout efetuado');
    toast.success('Logout realizado com sucesso!');
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('Tentando registro com:', { username, email, password });
      const response = await api.post('/api/auth/register', { username, email, password });
      setUser(response.data);
      console.log('Registro bem-sucedido:', response.data);
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Erro de registro:', axiosError.response?.data || axiosError.message);
      const errorMsg = Array.isArray(axiosError.response?.data?.error)
        ? axiosError.response.data.error.map(e => e.message).join(', ')
        : axiosError.response?.data?.error || 'Erro ao registrar usuário';
      throw new Error(errorMsg);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}