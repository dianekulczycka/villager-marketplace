import {ItemName} from '../enums/ItemName.ts';

export interface CreateItem {
    name: ItemName;
    price: number;
    count: number;
    description?: string;
}