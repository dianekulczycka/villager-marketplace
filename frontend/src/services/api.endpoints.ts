const roots = {
  auth: '/auth',
  users: '/users',
  items: '/items',
  admin: '/admin/users',
};

export const endpoints = {
  baseURL: 'http://localhost:3003',
  auth: {
    root: roots.auth,
    register: `${roots.auth}/register`,
    login: `${roots.auth}/login`,
    logout: `${roots.auth}/logout`,
    refresh: `${roots.auth}/refresh`,
    recovery: `${roots.auth}/account-recovery`,
  },
  users: {
    root: roots.users,
    byId: (id: number) => `${roots.users}/id/${id}`,
    me: `${roots.users}/profile`,
    stats: `${roots.users}/profile/stats`,
    delete: `${roots.users}/profile/soft-delete`,
    becomeSeller: `${roots.users}/profile/become-seller`,
  },
  items: {
    root: roots.items,
    byId: (id: number) => `${roots.items}/id/${id}`,
    increaseViews: (id: number) => `${roots.items}/id/${id}/views`,
    my: `${roots.items}/my`,
    delete: (id: number) => `${roots.items}/${id}/soft-delete`,
  },
  admin: {
    root: roots.admin,
    flagged: `${roots.admin}/flagged`,
    banned: `${roots.admin}/banned`,
    managers: `${roots.admin}/managers`,
    byId: (id: number) => `${roots.admin}/${id}`,
    delete: (id: number) => `${roots.admin}/${id}/soft-delete`,
    restore: (id: number) => `${roots.admin}/${id}/restore`,
    ban: (id: number) => `${roots.admin}/${id}/ban`,
    unban: (id: number) => `${roots.admin}/${id}/unban`,
    unflag: (id: number) => `${roots.admin}/${id}/unflag`,
    promote: (id: number) => `${roots.admin}/${id}/promote-manager`,
    demote: (id: number) => `${roots.admin}/${id}/demote`,
  },
} as const;

export const publicRoutes = [
  endpoints.auth.register,
  endpoints.auth.login,
  endpoints.auth.recovery,
];