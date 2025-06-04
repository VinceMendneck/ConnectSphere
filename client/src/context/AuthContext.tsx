import { useState, type ReactNode } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContextType';

interface User {
  id: number;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const { data } = await axios.post<{ token: string; userId: number }>(
      'http://localhost:3000/login',
      { email, password }
    );
    localStorage.setItem('token', data.token);
    setUser({ id: data.userId });
  };

  const register = async (email: string, password: string, username: string) => {
    await axios.post('http://localhost:3000/register', { email, password, username });
  };

  return (
    <AuthContext.Provider value={{ user, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
