import type {PaginationView} from '../../models/pagiantion/PaginationView.ts';
import {api} from '../api.config.ts';
import {endpoints} from '../api.endpoints.ts';
import type {ProfileStats} from '../../models/stats/ProfileStats.ts';
import type {UpdateUserReq} from '../../models/user/UpdateUserReq.ts';
import type {BecomeSellerReq} from '../../models/user/BecomeSellerReq.ts';
import type {UserQueryParams} from '../../models/user/UserQueryParams.ts';
import type {UserAdminView} from '../../models/user/UserAdminView.ts';

export const getAll = async (params?: UserQueryParams): Promise<PaginationView<UserAdminView>> => {
    const {data} = await api.get(endpoints.users.root, {params});
    return data;
};

export const getById = async (publicId: string): Promise<UserAdminView> => {
    const {data} = await api.get(endpoints.users.byId(publicId));
    return data;
};

export const getMe = async (): Promise<UserAdminView> => {
    const {data} = await api.get(endpoints.users.me);
    return data;
};

export const getUnreadMessages = async (): Promise<number> => {
    const {data} = await api.get(endpoints.users.unreadMessages);
    return data;
};

export const stats = async (): Promise<ProfileStats> => {
    const {data} = await api.get(endpoints.users.stats);
    return data;
};

export const update = async (dto: UpdateUserReq): Promise<UserAdminView> => {
    const {data} = await api.patch(endpoints.users.me, dto);
    return data;
};

export const uploadAvatar = async (
    file: File,
): Promise<UserAdminView> => {
    const formData = new FormData();
    formData.append('file', file);

    return await api.patch(
        endpoints.users.uploadAvatar,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'},},
    );
};

export const softDelete = async (
    password: string,
): Promise<void> => {
    await api.delete(endpoints.users.delete, {
        data: {password},
    });
};

export const becomeSeller = async (dto: BecomeSellerReq): Promise<void> => {
    await api.patch(endpoints.users.becomeSeller, dto);
};




