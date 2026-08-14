const API_URL: string = import.meta.env.VITE_API_URL;

const roots = {
    auth: '/auth',
    users: '/users',
    items: '/items',
    orders: '/orders',
    admin: '/admin/users',
    chats: '/chats',
};

export const endpoints = {
    baseURL: API_URL,

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
        byId: (publicId: string) =>
            `${roots.users}/id/${publicId}`,
        me: `${roots.users}/profile`,
        stats: `${roots.users}/profile/stats`,
        delete: `${roots.users}/profile/soft-delete`,
        becomeSeller: `${roots.users}/profile/become-seller`,
        uploadAvatar: `${roots.users}/profile/upload-avatar`,
    },

    items: {
        root: roots.items,
        byId: (publicId: string) =>
            `${roots.items}/id/${publicId}`,
        increaseViews: (publicId: string) =>
            `${roots.items}/id/${publicId}/views`,
        my: `${roots.items}/my`,
        delete: (publicId: string) =>
            `${roots.items}/id/${publicId}/soft-delete`,
    },

    orders: {
        root: roots.orders,
        order: (publicId: string) =>
            `${roots.orders}/id/${publicId}/order`,
        buying: `${roots.orders}/my/buying`,
        selling: `${roots.orders}/my/selling`,
        confirm: (publicId: string) =>
            `${roots.orders}/id/${publicId}/confirm`,
        reject: (publicId: string) =>
            `${roots.orders}/id/${publicId}/reject`,
    },

    chats: {
        root: roots.chats,
        byId: (userPublicId: string) =>
            `${roots.chats}/user-id/${userPublicId}`,
        markAsRead: (uuid: string) => `${roots.chats}/message-id/${uuid}/read`,
    },

    admin: {
        root: roots.admin,
        flagged: `${roots.admin}/flagged`,
        banned: `${roots.admin}/banned`,
        managers: `${roots.admin}/managers`,
        byId: (publicId: string) =>
            `${roots.admin}/id/${publicId}`,
        delete: (publicId: string) =>
            `${roots.admin}/id/${publicId}/soft-delete`,
        restore: (publicId: string) =>
            `${roots.admin}/id/${publicId}/restore`,
        ban: (publicId: string) =>
            `${roots.admin}/id/${publicId}/ban`,
        unban: (publicId: string) =>
            `${roots.admin}/id/${publicId}/unban`,
        unflag: (publicId: string) =>
            `${roots.admin}/id/${publicId}/unflag`,
        promote: (publicId: string) =>
            `${roots.admin}/id/${publicId}/promote-manager`,
        demote: (publicId: string) =>
            `${roots.admin}/id/${publicId}/demote`,
    },
} as const;
