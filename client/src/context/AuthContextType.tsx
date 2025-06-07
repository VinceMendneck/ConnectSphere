// client/src/context/AuthContextType.ts
import { createContext } from 'react';

export interface User {
  id: number; // Alinhado com ../types/index.ts
  username: string;
  email: string; // Mantido para compatibilidade com login
  password: string; // Mantido para compatibilidade
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (username: string, email: string, password: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);