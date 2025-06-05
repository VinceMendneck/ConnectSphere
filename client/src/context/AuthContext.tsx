// client/src/context/AuthContext.tsx
import { useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContextType';
import { type User } from '../types';
import api from '../services/mockApi';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    const data = response.data as { token: string; userId: number };
    localStorage.setItem('token', data.token);
    setUser({ id: data.userId, username: 'user_teste' });
  };

  const register = async (email: string, password: string, username: string) => {
    await api.post('/register', { email, password, username });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};