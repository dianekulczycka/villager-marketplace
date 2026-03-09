import type { PaginationRes } from '../../models/pagiantion/PaginationRes.ts';
import type { UserAdminView } from '../../models/user/UserAdminView.ts';
import { endpoints } from '../api.endpoints.ts';
import { api } from '../api.config.ts';
import type { UpdateUserDto } from '../../models/user/UpdateUserDto.ts';
import type { UserSelfView } from '../../models/user/UserSelfView.ts';

export const getFlagged = async (page?: number): Promise<PaginationRes<UserAdminView>> => {
  const { data } = await api.get(endpoints.admin.flagged, {
    params: {
      page,
    },
  });
  return data;
};

export const getBanned = async (page?: number): Promise<PaginationRes<UserAdminView>> => {
  const { data } = await api.get(endpoints.admin.banned, {
    params: {
      page,
    },
  });
  return data;
};

export const getManagers = async (page?: number): Promise<PaginationRes<UserAdminView>> => {
  const { data } = await api.get(endpoints.admin.managers, {
    params: {
      page,
    },
  });
  return data;
};

export const update = async (id: number, dto: UpdateUserDto): Promise<UserSelfView> => {
  const { data } = await api.patch(endpoints.admin.byId(id), dto);
  return data;
};

export const softDelete = async (id: number): Promise<void> => {
  await api.delete(endpoints.admin.delete(id));
};

export const restore = async (id: number): Promise<void> => {
  await api.patch(endpoints.admin.restore(id));
};

export const hardDelete = async (id: number): Promise<void> => {
  await api.delete(endpoints.admin.byId(id));
};

export const ban = async (id: number): Promise<void> => {
  await api.patch(endpoints.admin.ban(id));
};

export const unban = async (id: number): Promise<void> => {
  await api.patch(endpoints.admin.unban(id));
};

export const unflag = async (id: number): Promise<void> => {
  await api.patch(endpoints.admin.unflag(id));
};

export const promote = async (id: number): Promise<void> => {
  await api.patch(endpoints.admin.promote(id));
};

export const demote = async (id: number): Promise<void> => {
  await api.patch(endpoints.admin.demote(id));
};





