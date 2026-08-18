import type {CreateItemDto} from "../models/item/CreateItemDto.ts";
import type {UpdateItemDto} from "../models/item/UpdateItemDto.ts";
import {create, softDelete, update} from "../services/fetch/item.service.ts";

export const useItemActions = (
    handleMutation: (
        action: () => Promise<void>,
        successMessage: string,
    ) => Promise<void>,
) => {
    const createItem = async (data: CreateItemDto) => {
        await handleMutation(
            async () => {
                await create({
                    ...data,
                    description: data.description?.trim() || undefined,
                });
            },
            'Item created',
        );
    };

    const updateItem = async (
        publicId: string,
        dto: UpdateItemDto,
    ) => {
        await handleMutation(
            async () => {
                await update(publicId, dto);
            },
            'Item updated',
        );
    };

    const deleteItem = async (publicId: string) => {
        await handleMutation(
            async () => {
                await softDelete(publicId);
            },
            'Item deleted',
        );
    };

    return {
        createItem,
        updateItem,
        deleteItem,
    };
};