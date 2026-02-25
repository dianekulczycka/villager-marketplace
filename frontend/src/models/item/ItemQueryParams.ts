import type { QueryParams } from '../pagiantion/QueryParams.ts';
import type { ItemSortField } from '../enums/ItemSortField.ts';

export type ItemQueryParams =
  QueryParams<ItemSortField> & {
  sellerId?: number;
};