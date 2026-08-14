export const routes = {
    auth: {
        root: '/auth',
        login: '/auth/login',
        register: '/auth/register',
        recovery: '/auth/account-recovery',
    },

    users: {
        root: '/users',
        byId: '/users/id/:publicId',
        buildById: (publicId: string) => `/users/id/${publicId}`,
        me: '/users/profile',
        stats: '/users/profile/stats',
    },

    items: {
        root: '/items',
        bySellerId: (publicId: string) => `/items?sellerId=${publicId}`,
        byId: '/items/id/:publicId',
        buildById: (publicId: string) => `/items/id/${publicId}`,
        my: '/items/my',
    },

    orders: {
        root: '/orders',
    },

    chats: {
        root: '/chats',
        byId: '/chats/user-id/:userPublicId',
        buildById: (userPublicId: string) =>
            `/chats/user-id/${userPublicId}`,
    },

    admin: {
        root: '/admin/users',
        flagged: '/admin/users/flagged',
        banned: '/admin/users/banned',
        managers: '/admin/users/managers',
        byId: '/admin/users/id/:publicId',
        buildById: (publicId: string) =>
            `/admin/users/id/${publicId}`,
    },
} as const;

export const publicRoutes: string[] = [
    routes.auth.register,
    routes.auth.login,
    routes.auth.recovery,
];