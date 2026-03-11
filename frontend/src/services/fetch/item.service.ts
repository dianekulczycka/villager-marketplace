import type { PaginationRes } from '../../models/pagiantion/PaginationRes.ts';
import type { ItemView } from '../../models/item/ItemView.ts';
import { api } from '../api.config.ts';
import { endpoints } from '../api.endpoints.ts';
import type { ItemQueryParams } from '../../models/item/ItemQueryParams.ts';
import type { CreateItemDto } from '../../models/item/CreateItemDto.ts';
import type { UpdateItemDto } from '../../models/item/UpdateItemDto.ts';
import type { ItemAdminView } from '../../models/item/ItemAdminView.ts';

export const getAll = async (
  params?: ItemQueryParams,
): Promise<PaginationRes<ItemAdminView>> => {
  const { data } = await api.get(endpoints.items.root, { params });
  return data;
};

export const getById = async (id: number): Promise<ItemAdminView> => {
  const { data } = await api.get(endpoints.items.byId(id));
  return data;
};

export const increaseViews = async (id: number): Promise<void> => {
  await api.post(endpoints.items.increaseViews(id));
};

export const getMy = async (params?: ItemQueryParams): Promise<PaginationRes<ItemAdminView>> => {
  const { data } = await api.get(endpoints.items.my, { params });
  return data;
};

export const post = async (dto: CreateItemDto): Promise<ItemView> => {
  const { data } = await api.post(endpoints.items.root, dto);
  return data;
};

export const update = async (id: number, dto: UpdateItemDto): Promise<ItemView> => {
  const { data } = await api.patch(`${endpoints.items.byId(id)}`, dto);
  return data;
};

export const softDelete = async (id: number): Promise<void> => {
  await api.delete(endpoints.items.delete(id));
};