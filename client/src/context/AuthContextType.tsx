import { createContext } from 'react';

interface User {
  id: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);