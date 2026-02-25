import { ItemName } from '../enums/ItemName.ts';

export interface CreateItemDto {
  name: ItemName;
  price: number;
  count: number;
  description?: string;
}