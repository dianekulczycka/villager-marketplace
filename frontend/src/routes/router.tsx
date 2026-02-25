import { createBrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { AuthProvider } from '../store/providers/AuthProvider.tsx';
import PublicLayout from '../ui/layouts/PublicLayout.tsx';
import LoginPage from '../ui/pages/auth/LoginPage.tsx';
import RegisterPage from '../ui/pages/auth/RegisterPage.tsx';
import BasicLayout from '../ui/layouts/BasicLayout.tsx';
import ItemsPage from '../ui/pages/items/ItemsPage.tsx';
import ItemDetailsPage from '../ui/pages/items/ItemDetailsPage.tsx';
import UsersPage from '../ui/pages/users/UsersPage.tsx';
import ErrorPage404 from '../ui/pages/error/ErrorPage404.tsx';
import { routes } from './routes.ts';

export const router = createBrowserRouter([
  {
    element: (
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <AuthProvider />
      </QueryParamProvider>
    ),
    children: [
      {
        path: routes.auth.root,
        element: <PublicLayout />,
        children: [
          { path: routes.auth.login, element: <LoginPage /> },
          { path: routes.auth.register, element: <RegisterPage /> },
        ],
      },
      {
        path: '/',
        element: <BasicLayout />,
        children: [
          {
            path: routes.items.root,
            children: [
              { index: true, element: <ItemsPage /> },
              { path: routes.items.byId, element: <ItemDetailsPage /> },
            ],
          },
          {
            path: routes.users.root,
            children: [
              { index: true, element: <UsersPage /> },
              { path: routes.users.byId, element: <ItemsPage /> },
            ],
          },
          {
            path: '*',
            element: <ErrorPage404 />,
          },
        ],
      },
    ],
  },
]);