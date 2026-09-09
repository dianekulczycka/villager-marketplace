import type {CreateItemDto} from "./CreateItemDto.ts";

export type UpdateItemDto = Partial<Omit<CreateItemDto, 'name'>>;