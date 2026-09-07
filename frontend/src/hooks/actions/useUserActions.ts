import {
    ban,
    demote,
    hardDelete,
    promote,
    restore,
    softDelete as adminSoftDelete,
    update as adminUpdate,
    unban,
    unflag
} from '../../services/fetch/admin.service.ts';
import {
    becomeSeller,
    softDelete,
    uploadAvatar,
    update
} from "../../services/fetch/user.service.ts";
import type {UserAdminView} from '../../models/user/UserAdminView.ts';
import type {UpdateUserDto} from "../../models/user/UpdateUserDto.ts";
import type {BecomeSellerDto} from "../../models/user/BecomeSellerDto.ts";

export const useUserActions = () => {
    // user
    const updateProfile = (dto: UpdateUserDto) => update(dto);
    const changeAvatar = (file: File) => uploadAvatar(file);
    const onBecomeSeller = (dto: BecomeSellerDto) => becomeSeller(dto);
    const deleteProfile = () => softDelete();

    // admin
    const updateUser = (publicId: string, dto: UpdateUserDto) => adminUpdate(publicId, dto);
    const deleteUser = (publicId: string) => adminSoftDelete(publicId);
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
        updateProfile,
        updateUser,
        changeAvatar,
        onBecomeSeller,
        deleteProfile,
        deleteUser,
        hardDeleteUser,
        toggleBan,
        togglePromote,
        unflagUser,
        restoreUser,
    };
};