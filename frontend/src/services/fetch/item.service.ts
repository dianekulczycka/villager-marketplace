import type { PaginationRes } from '../../models/pagiantion/PaginationRes.ts';
import type { ItemView } from '../../models/item/ItemView.ts';
import { api } from '../api.config.ts';
import { endpoints } from '../api.endpoints.ts';
import type { ItemDetailedView } from '../../models/item/ItemDetailedView.ts';
import type { CreateItemDto } from '../../models/item/CreateItemDto.ts';
import type { UpdateItemDto } from '../../models/item/UpdateItemDto.ts';
import type { ItemQueryParams } from '../../models/item/ItemQueryParams.ts';

export const getAll = async (
  params?: ItemQueryParams
): Promise<PaginationRes<ItemView>> => {
  const { data } = await api.get(endpoints.items.root, { params });
  return data;
};

export const getById = async (id: number): Promise<ItemDetailedView> => {
  const { data } = await api.get(endpoints.items.byId(id));
  return data;
};

export const increaseViews = async (id: number): Promise<void> => {
  await api.post(endpoints.items.increaseViews(id));
};

export const getMy = async (): Promise<void> => {
  await api.post(endpoints.items.my);
};

export const post = async (dto: CreateItemDto): Promise<ItemView> => {
  const { data } = await api.post(endpoints.items.root, dto);
  return data;
};

export const update = async (dto: UpdateItemDto): Promise<ItemView> => {
  const { data } = await api.patch(endpoints.items.root, dto);
  return data;
};

export const softDelete = async (id: number): Promise<void> => {
  await api.patch(endpoints.items.delete(id));
};