const API_URL: string = import.meta.env.VITE_API_URL;

export const routes = {
    auth: {
        root: '/auth',
        login: 'login',
        register: 'register',
        recovery: 'account-recovery',
    },

    users: {
        root: '/users',
        byId: 'id/:publicId',
        me: 'profile',
        stats: 'profile/stats',
    },

    items: {
        root: '/items',
        bySellerId: (publicId: string) => `/items?sellerId=${publicId}`,
        byId: 'id/:publicId',
        my: 'my',
    },

    orders: {
        root: '/orders',
    },

    admin: {
        root: '/admin/users',
        flagged: 'flagged',
        banned: 'banned',
        managers: 'managers',
        byId: ':publicId',
    },
    icons: {
        item: (iconUrl: string) => `${API_URL}/icons/item/${iconUrl}`,
        user: (iconUrl: string) => `${API_URL}/icons/user/${iconUrl}`,
    }
} as const;

export const publicRoutes = [
    '/auth/register', '/auth/login', '/auth/account-recovery',
];