import {
    ban,
    demote,
    hardDelete,
    promote,
    restore,
    softDelete as adminSoftDelete,
    unban,
    unflag,
    update as adminUpdate
} from '../../services/fetch/admin.service.ts';
import {becomeSeller, softDelete, update, uploadAvatar} from "../../services/fetch/user.service.ts";
import type {UserAdminView} from '../../models/user/UserAdminView.ts';
import type {UpdateUserReq} from "../../models/user/UpdateUserReq.ts";
import type {BecomeSellerReq} from "../../models/user/BecomeSellerReq.ts";

export const useUserActions = () => {
    // user
    const updateProfile = (dto: UpdateUserReq) => update(dto);
    const changeAvatar = (file: File) => uploadAvatar(file);
    const onBecomeSeller = (dto: BecomeSellerReq) => becomeSeller(dto);
    const deleteProfile = (password: string) => softDelete(password);

    // admin
    const updateUser = (publicId: string, dto: UpdateUserReq) => adminUpdate(publicId, dto);
    const deleteUser = (publicId: string, password: string) => adminSoftDelete(publicId, password);
    const hardDeleteUser = (publicId: string, password: string) => hardDelete(publicId, password);
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