import {createContext} from 'react';
import type {UserAdminView} from '../../models/user/UserAdminView.ts';

export interface AuthContext {
    user: UserAdminView | null;
    setUser: (user: UserAdminView | null) => void;
    loadUser: () => Promise<void>;
    logoutUser: () => void;
    isLoaded: boolean;
    isAuthority: boolean;
}

export const AuthContext = createContext<AuthContext>({
    user: null,
    setUser: () => {
    },
    loadUser: async () => {
    },
    logoutUser: () => {
    },
    isLoaded: false,
    isAuthority: false
});