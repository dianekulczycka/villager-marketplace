import type { PaginationRes } from '../../models/pagiantion/PaginationRes.ts';
import type { UserPublicView } from '../../models/user/UserPublicView.ts';
import { api } from '../api.config.ts';
import { endpoints } from '../api.endpoints.ts';
import type { UserSelfView } from '../../models/user/UserSelfView.ts';
import type { ProfileStats } from '../../models/stats/ProfileStats.ts';
import type { UpdateUserDto } from '../../models/user/UpdateUserDto.ts';
import type { BecomeSellerDto } from '../../models/user/BecomeSellerDto.ts';
import type { UserQueryParams } from '../../models/user/UserQueryParams.ts';

export const getAll = async (params?: UserQueryParams): Promise<PaginationRes<UserPublicView>> => {
  const { data } = await api.get(endpoints.users.root, { params });
  return data;
};

export const getById = async (id: number): Promise<UserPublicView> => {
  const { data } = await api.get(endpoints.users.byId(id));
  return data;
};

export const getMe = async (): Promise<UserSelfView> => {
  const { data } = await api.get(endpoints.users.me);
  return data;
};

export const stats = async (): Promise<ProfileStats> => {
  const { data } = await api.get(endpoints.users.stats);
  return data;
};

export const update = async (dto: UpdateUserDto): Promise<UserSelfView> => {
  const { data } = await api.patch(endpoints.users.me, dto);
  return data;
};

export const softDelete = async (): Promise<void> => {
  await api.patch(endpoints.users.delete);
};

export const becomeSeller = async (dto: BecomeSellerDto): Promise<void> => {
  await api.patch(endpoints.users.becomeSeller, dto);
};




