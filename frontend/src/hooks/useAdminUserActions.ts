import {
    ban,
    demote,
    hardDelete,
    promote,
    restore,
    softDelete,
    unban,
    unflag,
    update
} from '../services/fetch/admin.service';
import type {UserAdminView} from '../models/user/UserAdminView';
import type {UpdateUserDto} from "../models/user/UpdateUserDto.ts";

export const useAdminUserActions = (
    handleMutation: (
        action: () => Promise<void>,
        successMessage: string,
    ) => Promise<void>,
) => {
    const updateUser = async (
        publicId: string,
        dto: UpdateUserDto,
    ) => {
        await handleMutation(
            async () => {
                await update(publicId, dto);
            },
            'User updated',
        );
    };

    const deleteUser = async (publicId: string) => {
        await handleMutation(
            async () => {
                await softDelete(publicId);
            },
            'User deleted',
        );
    };

    const hardDeleteUser = async (publicId: string) => {
        await handleMutation(
            async () => {
                await hardDelete(publicId);
            },
            'User hard deleted',
        );
    };

    const toggleBan = async (user: UserAdminView) => {
        await handleMutation(
            async () => {
                await (
                    user.isBanned
                        ? unban(user.publicId)
                        : ban(user.publicId)
                );
            },
            user.isBanned
                ? 'User unbanned'
                : 'User banned',
        );
    };

    const togglePromote = async (user: UserAdminView) => {
        await handleMutation(
            async () => {
                await (
                    user.role !== 'MANAGER'
                        ? promote(user.publicId)
                        : demote(user.publicId)
                );
            },
            user.role !== 'MANAGER'
                ? 'User promoted'
                : 'User demoted',
        );
    };

    const unflagUser = async (user: UserAdminView) => {
        if (!user.isFlagged) return;

        await handleMutation(
            async () => {
                await unflag(user.publicId);
            },
            'User unflagged',
        );
    };

    const restoreUser = async (user: UserAdminView) => {
        if (!user.isDeleted) return;

        await handleMutation(
            async () => {
                await restore(user.publicId);
            },
            'User restored',
        );
    };

    return {
        updateUser,
        deleteUser,
        hardDeleteUser,
        toggleBan,
        togglePromote,
        unflagUser,
        restoreUser,
    };
};