import { type FC, useEffect, useState } from 'react';
import type { UserSelfView } from '../../models/user/UserSelfView.ts';
import { AuthContext } from '../context/auth.context.ts';
import { Outlet, useLocation } from 'react-router';
import { getMe } from '../../services/fetch/user.service.ts';
import { publicRoutes } from '../../routes/routes.ts';
import { logout } from '../../services/fetch/auth.service.ts';

export const AuthProvider: FC = () => {
  const [user, setUser] = useState<UserSelfView | null>(null);
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
    } catch {
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