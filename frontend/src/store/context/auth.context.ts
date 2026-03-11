import { createContext } from 'react';
import type { UserAdminView } from '../../models/user/UserAdminView.ts';

export interface AuthContext {
  user: UserAdminView | null;
  setUser: (user: UserAdminView | null) => void;
  loadUser: () => void;
  logoutUser: () => void;
  isLoaded: boolean;
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  setUser: () => {
  },
  loadUser: () => {
  },
  logoutUser: () => {
  },
  isLoaded: false,
});