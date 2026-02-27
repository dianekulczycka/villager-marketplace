export const routes = {
  auth: {
    root: '/auth',
    login: 'login',
    register: 'register',
    recovery: 'account-recovery',
  },

  users: {
    root: '/users',
    byId: 'id/:id',
    me: 'profile',
    stats: 'profile/stats',
  },

  items: {
    root: '/items',
    bySellerId: (id: number) => `/items?sellerId=${id}`,
    byId: 'id/:id',
    my: 'my',
  },

  admin: {
    root: '/admin/users',
    flagged: 'flagged',
    banned: 'banned',
    managers: 'managers',
    byId: ':id',
  },
  icons: {
    item: (iconUrl: string) => `http://localhost:3003/icons/item/${iconUrl}`,
    user: (iconUrl: string) => `http://localhost:3003/icons/user/${iconUrl}`,
  }
} as const;

export const publicRoutes = [
  '/auth/register', '/auth/login', '/auth/account-recovery',
];