import {
    ban,
    demote,
    hardDelete,
    promote,
    restore,
    softDelete as softDeleteUser,
    unban,
    unflag,
    update
} from '../../services/fetch/admin.service.ts';
import {
    becomeSeller,
    softDelete,
    uploadAvatar,
} from "../../services/fetch/user.service.ts";
import type {UserAdminView} from '../../models/user/UserAdminView.ts';
import type {UpdateUserDto} from "../../models/user/UpdateUserDto.ts";
import type {BecomeSellerDto} from "../../models/user/BecomeSellerDto.ts";

export const useUserActions = () => {
    // user
    const updateUser = (publicId: string, dto: UpdateUserDto) => update(publicId, dto);
    const changeAvatar = (file: File) => uploadAvatar(file);
    const onBecomeSeller = (dto: BecomeSellerDto) => becomeSeller(dto);
    const deleteMyProfile = () => softDelete();

    // admin
    const deleteUser = (publicId: string) => softDeleteUser(publicId);
    const hardDeleteUser = (publicId: string) => hardDelete(publicId);
    const toggleBan = (user: UserAdminView) =>
        user.isBanned
            ? unban(user.publicId)
            : ban(user.publicId);

    const togglePromote = (user: UserAdminView) =>
        user.role !== 'MANAGER'
            ? promote(user.publicId)
            : demote(user.publicId);

    const unflagUser = (user: UserAdminView) =>
        user.isFlagged
            ? unflag(user.publicId)
            : Promise.resolve();

    const restoreUser = (user: UserAdminView) =>
        user.isDeleted
            ? restore(user.publicId)
            : Promise.resolve();

    return {
        updateUser,
        changeAvatar,
        onBecomeSeller,
        deleteMyProfile,
        deleteUser,
        hardDeleteUser,
        toggleBan,
        togglePromote,
        unflagUser,
        restoreUser,
    };
};