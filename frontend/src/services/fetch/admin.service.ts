import type {PaginationRes} from '../../models/pagiantion/PaginationRes.ts';
import type {UserAdminView} from '../../models/user/UserAdminView.ts';
import {endpoints} from '../api.endpoints.ts';
import {api} from '../api.config.ts';
import type {UpdateUserDto} from '../../models/user/UpdateUserDto.ts';
import type {UserSelfView} from '../../models/user/UserSelfView.ts';
import type {UserQueryParams} from '../../models/user/UserQueryParams.ts';

export const getFlagged = async (params?: UserQueryParams): Promise<PaginationRes<UserAdminView>> => {
    const {data} = await api.get(endpoints.admin.flagged, {params});
    return data;
};

export const getBanned = async (params?: UserQueryParams): Promise<PaginationRes<UserAdminView>> => {
    const {data} = await api.get(endpoints.admin.banned, {params});
    return data;
};

export const getManagers = async (params?: UserQueryParams): Promise<PaginationRes<UserAdminView>> => {
    const {data} = await api.get(endpoints.admin.managers, {params});
    return data;
};

export const update = async (publicId: string, dto: UpdateUserDto): Promise<UserSelfView> => {
    const {data} = await api.patch(endpoints.admin.byId(publicId), dto);
    return data;
};

export const softDelete = async (publicId: string): Promise<void> => {
    await api.delete(endpoints.admin.delete(publicId));
};

export const restore = async (publicId: string): Promise<void> => {
    await api.patch(endpoints.admin.restore(publicId));
};

export const hardDelete = async (publicId: string): Promise<void> => {
    await api.delete(endpoints.admin.byId(publicId));
};

export const ban = async (publicId: string): Promise<void> => {
    await api.patch(endpoints.admin.ban(publicId));
};

export const unban = async (publicId: string): Promise<void> => {
    await api.patch(endpoints.admin.unban(publicId));
};

export const unflag = async (publicId: string): Promise<void> => {
    await api.patch(endpoints.admin.unflag(publicId));
};

export const promote = async (publicId: string): Promise<void> => {
    await api.patch(endpoints.admin.promote(publicId));
};

export const demote = async (publicId: string): Promise<void> => {
    await api.patch(endpoints.admin.demote(publicId));
};





