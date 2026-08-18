import React, {type FC, useRef, useState} from 'react';
import UserProfileComponent from '../../components/user/UserProfileComponent.tsx';
import {useAuth} from '../../../store/helpers/useAuth.ts';
import {getMy,} from '../../../services/fetch/item.service.ts';
import {
    becomeSeller,
    getAll,
    softDelete,
    stats as loadStats,
    uploadAvatar,
} from '../../../services/fetch/user.service.ts';
import {ItemSortField} from '../../../models/enums/ItemSortField.ts';
import type {BecomeSellerDto} from '../../../models/user/BecomeSellerDto.ts';
import {Box} from '@mui/material';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.tsx';
import UpdateItemModal from '../../components/modals/UpdateItemModal.tsx';
import CreateItemModal from '../../components/modals/CreateItemModal.tsx';
import BecomeSellerModal from '../../components/modals/BecomeSellerModal.tsx';
import UpdateUserModal from '../../components/modals/UpdateUserModal.tsx';
import type {UpdateUserDto} from '../../../models/user/UpdateUserDto.ts';
import type {ItemAdminView} from '../../../models/item/ItemAdminView.ts';
import type {UserAdminView} from '../../../models/user/UserAdminView.ts';
import SellerView from '../../components/user/profile/SellerView.tsx';
import type {UserQueryParams} from '../../../models/user/UserQueryParams.ts';
import AdminView from '../../components/user/profile/AdminView.tsx';
import type {PaginationRes} from '../../../models/pagiantion/PaginationRes.ts';
import type {UserSortField} from '../../../models/enums/UserSortField.ts';
import {getBanned, getFlagged, getManagers,} from '../../../services/fetch/admin.service.ts';
import type {ProfileStats} from '../../../models/stats/ProfileStats.ts';
import {useQuery} from '@tanstack/react-query';
import {useMutationHandler} from "../../../hooks/useMutationHandler.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import type {ItemQueryParams} from "../../../models/item/ItemQueryParams.ts";
import PreloaderComponent from "../../components/shared/PreloaderComponent.tsx";
import {ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE} from "../../../validation/avatar-upload.constraints.ts";
import {useAdminUserActions} from "../../../hooks/useAdminUserActions.ts";
import {useItemActions} from "../../../hooks/useItemActions.ts";
import {ProfilePageView} from "../../../models/enums/ProfilePageView.ts";
import type {UpdateItemDto} from "../../../models/item/UpdateItemDto.ts";
import {useModalState} from "../../../hooks/useModalState.ts";
import {type PaginationQuery, usePaginatedQuery} from "../../../hooks/usePaginatedQuery.ts";

const UserProfilePage: FC = () => {
    const {user, loadUser, logoutUser} = useAuth();

    const userRole = user?.role;
    const isAuthority = userRole === 'ADMIN' || userRole === 'MANAGER';

    const [pageView, setPageView] = useState<ProfilePageView>(
        isAuthority ? ProfilePageView.USERS : ProfilePageView.ITEMS,
    );

    const {
        activeModal,
        selected: selectedItem,
        openModal: openItemModal,
        closeModal,
    } = useModalState<ItemAdminView>();

    const {
        selected: selectedUser,
        openModal: openUserModal,
    } = useModalState<UserAdminView>();

    const openBecomeModal = () => openItemModal('become');
    const openCreateModal = () => openItemModal('create');

    const openUpdateItemModal = (item: ItemAdminView) =>
        openItemModal('updateItem', item);

    const openDeleteItemModal = (item: ItemAdminView) =>
        openItemModal('deleteItem', item);

    const openUpdateUserModal = (user: UserAdminView) =>
        openUserModal('updateUser', user);

    const openDeleteUserModal = (user: UserAdminView) =>
        openUserModal('deleteUser', user);

    const openDeleteMyProfileModal = (user: UserAdminView) =>
        openUserModal('deleteMyProfile', user);

    const openHardDeleteModal = (user: UserAdminView) =>
        openUserModal('hardDeleteUser', user);

    const fetchPageData = (
        query: PaginationQuery,
    ): Promise<PaginationRes<ItemAdminView | UserAdminView>> => {
        const params = {
            page: query.page,
            perPage: query.perPage,
        };
        const sortDirection =
            query.sortDirection as 'asc' | 'desc' | undefined;
        const errorMsg = 'Invalid query state';

        switch (pageView) {
            case ProfilePageView.ITEMS:
                if (userRole !== 'SELLER') throw new Error(errorMsg);

                return getMy({
                    ...params,
                    sortBy: query.sortBy as ItemSortField | undefined,
                    sortDirection,
                    search: query.search ?? undefined,
                });

            case ProfilePageView.USERS:
                if (!isAuthority) throw new Error(errorMsg);

                return getAll({
                    ...params,
                    sortBy: query.sortBy as UserSortField | undefined,
                    sortDirection,
                    search: query.search ?? undefined,
                });

            case ProfilePageView.FLAGGED:
                if (!isAuthority) throw new Error(errorMsg);
                return getFlagged(params);

            case ProfilePageView.BANNED:
                if (!isAuthority) throw new Error(errorMsg);
                return getBanned(params);

            case ProfilePageView.MANAGERS:
                if (userRole !== 'ADMIN') throw new Error(errorMsg);
                return getManagers(params);

            default:
                throw new Error(errorMsg);
        }
    };

    const {
        query,
        setQuery,
        data,
        isLoading,
        error,
        refetch,
        handlePageChange,
    } = usePaginatedQuery<PaginationRes<ItemAdminView | UserAdminView>>(
        'profilePage',
        fetchPageData,
        undefined,
        undefined,
        {enabled: !!userRole}
    );

    const {
        data: stats,
        isLoading: statsLoading,
        error: statsError,
    } = useQuery<ProfileStats>({
        queryKey: ['profileStats', user?.publicId],
        queryFn: loadStats,
        enabled: !!user,
    });

    const {
        openSnackbar,
        setOpenSnackbar,
        snackbarText,
        snackbarStatus,
        handleMutation,
        isMutating
    } = useMutationHandler(refetch);

    const {
        updateUser,
        deleteUser,
        hardDeleteUser,
        toggleBan,
        togglePromote,
        unflagUser,
        restoreUser,
    } = useAdminUserActions(handleMutation);

    const {
        createItem,
        updateItem,
        deleteItem,
    } = useItemActions(handleMutation);

    const handleUpdateUser = async (dto: UpdateUserDto) => {
        if (!selectedUser) return;
        await updateUser(selectedUser.publicId, dto);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        await deleteUser(selectedUser.publicId);
    };

    const handleHardDeleteUser = async () => {
        if (!selectedUser) return;
        await hardDeleteUser(selectedUser.publicId);
    };

    const handleUpdateItem = async (dto: UpdateItemDto) => {
        if (!selectedItem) return;
        await updateItem(selectedItem.publicId, dto);
    };

    const handleDeleteItem = async () => {
        if (!selectedItem) return;
        await deleteItem(selectedItem.publicId);
    };

    const onBecomeSeller = async (data: BecomeSellerDto) => {
        await handleMutation(
            async () => {
                await becomeSeller(data);
                loadUser();
            },
            'Switched to seller',
        );
    };

    const deleteMyProfile = async () => {
        await softDelete();
        logoutUser();
    };

    const changeView = (view: ProfilePageView) => {
        setPageView(view);
        setQuery({page: 1});
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadAvatar = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;
        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) throw new Error('Avatar must be PNG or JPEG');
        if (file.size > MAX_AVATAR_SIZE) throw new Error('Avatar size must not be gt 5 MB');

        await handleMutation(
            async () => {
                await uploadAvatar(file);
                loadUser();
            },
            'Avatar chnaged!',
        );

        e.target.value = '';
    };

    if (!user) return null;

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>

            {isMutating && <PreloaderComponent/>}

            <UserProfileComponent
                user={user}
                openBecomeModal={openBecomeModal}
                openCreateModal={openCreateModal}
                openUpdateUserModal={openUpdateUserModal}
                openDeleteMyProfileModal={openDeleteMyProfileModal}
                changeView={changeView}
                stats={stats}
                error={statsError}
                loading={statsLoading}
                onUploadAvatar={handleUploadAvatar}
                onAvatarChange={handleAvatarChange}
                fileInputRef={fileInputRef}
            />

            {userRole === 'SELLER' && pageView === ProfilePageView.ITEMS && (
                <SellerView
                    query={query as ItemQueryParams}
                    setQuery={setQuery}
                    items={data as PaginationRes<ItemAdminView>}
                    loading={isLoading}
                    error={error}
                    handlePageChange={handlePageChange}
                    openUpdateModal={openUpdateItemModal}
                    openDeleteModal={openDeleteItemModal}
                />
            )}

            {isAuthority && pageView !== ProfilePageView.ITEMS && (
                <AdminView
                    query={query as UserQueryParams}
                    setQuery={setQuery}
                    users={data as PaginationRes<UserAdminView>}
                    loading={isLoading}
                    error={error}
                    openUpdateModal={openUpdateUserModal}
                    openDeleteModal={openDeleteUserModal}
                    openHardDeleteModal={openHardDeleteModal}
                    toggleBan={toggleBan}
                    togglePromote={togglePromote}
                    unflagUser={unflagUser}
                    restoreUser={restoreUser}
                    handlePageChange={handlePageChange}
                />
            )}

            <UpdateUserModal
                open={activeModal === 'updateUser'}
                closeModal={closeModal}
                onUpdateUser={handleUpdateUser}
                selectedUser={selectedUser}
            />

            <ConfirmDeleteModal
                open={
                    activeModal === 'deleteMyProfile' ||
                    activeModal === 'deleteUser' ||
                    activeModal === 'hardDeleteUser' ||
                    activeModal === 'deleteItem'
                }
                closeModal={closeModal}
                deleteEntity={
                    activeModal === 'deleteMyProfile'
                        ? deleteMyProfile
                        : activeModal === 'hardDeleteUser'
                            ? handleHardDeleteUser
                            : activeModal === 'deleteItem'
                                ? handleDeleteItem
                                : handleDeleteUser
                }
            />

            <CreateItemModal
                open={activeModal === 'create'}
                closeModal={closeModal}
                onCreateItem={createItem}
            />
            <UpdateItemModal
                open={activeModal === 'updateItem'}
                closeModal={closeModal}
                updateItem={handleUpdateItem}
                selectedItem={selectedItem}
            />
            <BecomeSellerModal
                open={activeModal === 'become'}
                closeModal={closeModal}
                onBecomeSeller={onBecomeSeller}
            />

            <InfoSnackbar
                open={openSnackbar}
                setOpen={setOpenSnackbar}
                text={snackbarText}
                status={snackbarStatus}
            />

        </Box>
    );
};

export default UserProfilePage;