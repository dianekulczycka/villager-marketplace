import type {CreateItem} from "./CreateItem.ts";

export type UpdateItem = Partial<Omit<CreateItem, 'name'>>;