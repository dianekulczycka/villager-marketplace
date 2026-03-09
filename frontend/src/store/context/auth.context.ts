import { createContext } from 'react';
import type { UserSelfView } from '../../models/user/UserSelfView.ts';
import type { UserAdminView } from '../../models/user/UserAdminView.ts';

export interface AuthContext {
  user: UserAdminView | null;
  setUser: (user: UserSelfView | null) => void;
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