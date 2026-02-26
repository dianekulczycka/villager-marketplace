import { createContext } from "react";
import type { UserSelfView } from '../../models/user/UserSelfView.ts';

export interface AuthContext {
  user: UserSelfView | null;
  setUser: (user: UserSelfView | null) => void;
  loadUser: () => void;
  isLoaded: boolean
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  setUser: () => {},
  loadUser: () => {},
  isLoaded: false,
});