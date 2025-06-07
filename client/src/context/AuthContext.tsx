// client/src/context/AuthContext.tsx
import {type  ReactNode, useState } from 'react';
import { AuthContext,type User } from './AuthContextType';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    // Mock simples para teste
    if (email && password) {
      const newUser: User = {
        id: Date.now(), // ID fictício
        username: email.split('@')[0],
        email,
        password,
      };
      setUser(newUser);
      console.log('Login efetuado:', newUser); // Para debug
    } else {
      throw new Error('Email ou senha inválidos');
    }
  };

  const logout = () => {
    setUser(null);
    console.log('Logout efetuado');
  };

  const register = (username: string, email: string, password: string) => {
    const newUser: User = {
      id: Date.now(),
      username,
      email,
      password,
    };
    setUser(newUser);
    console.log('Registro efetuado:', newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}