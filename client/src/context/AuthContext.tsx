import { type ReactNode, useState, useEffect } from 'react';
import { AuthContext, type User, type AuthContextType } from './AuthContextType';
import api from '../services/api';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

interface ApiError {
  error: { message: string }[] | string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determina o tema inicial com base no localStorage
  const isDarkMode = localStorage.getItem('theme') !== 'light';

  // Verifica token no carregamento inicial
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Verificando token no carregamento inicial');
          const response = await api.get('/api/auth/me');
          console.log('Usuário autenticado:', response.data);
          setUser(response.data);
        } catch (error) {
          console.error('Erro ao validar token:', error);
          localStorage.removeItem('token');
          setUser(null);
          toast.error('Sessão inválida. Faça login novamente.');
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Tentando login com:', { email });
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
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    console.log('Logout efetuado');
    toast.success('Logout realizado com sucesso!');
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
  try {
    console.log('Tentando registro com:', { username, email });
    const response = await api.post('/api/auth/register', { username, email, password });
    console.log('Resposta do registro:', response.data);
    const { id, token } = response.data;
    if (!token) {
      throw new Error('Token não retornado pelo servidor');
    }
    localStorage.setItem('token', token);
    const userResponse = await api.get(`/api/users/${id}`);
    setUser(userResponse.data);
    console.log('Registro bem-sucedido:', userResponse.data);
    return true;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    console.error('Erro de registro:', axiosError.response?.data || axiosError.message);
    const errorMsg = Array.isArray(axiosError.response?.data?.error)
      ? axiosError.response.data.error.map(e => e.message).join(', ')
      : axiosError.response?.data?.error || 'Erro ao registrar usuário';
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
};

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isLoading,
  };

  if (isLoading) {
    return <LoadingSkeleton isDarkMode={isDarkMode} />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}