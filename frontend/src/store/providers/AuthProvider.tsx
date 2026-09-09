import {type FC, useEffect, useState} from 'react';
import {AuthContext} from '../context/auth.context.ts';
import {Outlet} from 'react-router';
import {getMe} from '../../services/fetch/user.service.ts';
import {logout} from '../../services/fetch/auth.service.ts';
import type {UserAdminView} from '../../models/user/UserAdminView.ts';

export const AuthProvider: FC = () => {
    const [user, setUser] = useState<UserAdminView | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const isAuthority =
        user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const loadUser = async () => {
        try {
            const user = await getMe();
            setUser(user);
        } catch {
            setUser(null);
        } finally {
            setIsLoaded(true);
        }
    };

    const logoutUser = async () => {
        try {
            await logout();
        } catch (e) {
            if (e instanceof Error) {
                throw e;
            }
        } finally {
            setUser(null);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{user, setUser, loadUser, logoutUser, isLoaded, isAuthority}}>
            <Outlet/>
        </AuthContext.Provider>
    );
};