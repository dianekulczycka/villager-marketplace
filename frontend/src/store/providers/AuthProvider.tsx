import { type FC, useEffect, useState } from 'react';
import { AuthContext } from '../context/auth.context.ts';
import { Outlet, useLocation } from 'react-router';
import { getMe } from '../../services/fetch/user.service.ts';
import { publicRoutes } from '../../routes/routes.ts';
import { logout } from '../../services/fetch/auth.service.ts';
import type { UserAdminView } from '../../models/user/UserAdminView.ts';

export const AuthProvider: FC = () => {
  const [user, setUser] = useState<UserAdminView | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

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
    if (publicRoutes.includes(location.pathname)) {
      setIsLoaded(true);
      return;
    }
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loadUser, logoutUser, isLoaded }}>
      <Outlet />
    </AuthContext.Provider>
  );
};