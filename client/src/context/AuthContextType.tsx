// client/src/context/AuthContextType.ts
import { createContext } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  bio?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);