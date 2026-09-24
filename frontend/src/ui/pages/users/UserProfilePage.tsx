import React, {type FC, useRef, useState} from 'react';
import UserProfileComponent from '../../components/user/UserProfileComponent.tsx';
import {useAuth} from '../../../store/helpers/useAuth.ts';
import {getMy,} from '../../../services/fetch/item.service.ts';
import {getAll, stats as loadStats,} from '../../../services/fetch/user.service.ts';
import {ItemSortField} from '../../../models/enums/ItemSortField.ts';
import type {BecomeSellerReq} from '../../../models/user/BecomeSellerReq.ts';
import {Box} from '@mui/material';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.tsx';
import UpdateItemModal from '../../components/modals/UpdateItemModal.tsx';
import CreateItemModal from '../../components/modals/CreateItemModal.tsx';
import BecomeSellerModal from '../../components/modals/BecomeSellerModal.tsx';
import UpdateUserModal from '../../components/modals/UpdateUserModal.tsx';
import type {UpdateUserReq} from '../../../models/user/UpdateUserReq.ts';
import type {ItemAdminView} from '../../../models/item/ItemAdminView.ts';
import type {UserAdminView} from '../../../models/user/UserAdminView.ts';
import SellerView from '../../components/user/profile/SellerView.tsx';
import type {UserQueryParams} from '../../../models/user/UserQueryParams.ts';
import AdminView from '../../components/user/profile/AdminView.tsx';
import type {UserSortField} from '../../../models/enums/UserSortField.ts';
import {getBanned, getFlagged, getManagers,} from '../../../services/fetch/admin.service.ts';
import type {ProfileStats} from '../../../models/stats/ProfileStats.ts';
import {useQuery} from '@tanstack/react-query';
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import type {ItemQueryParams} from "../../../models/item/ItemQueryParams.ts";
import PreloaderComponent from "../../components/shared/PreloaderComponent.tsx";
import {ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE} from "../../../validation/avatar-upload.constraints.ts";
import {useUserActions} from "../../../hooks/actions/useUserActions.ts";
import {useItemActions} from "../../../hooks/actions/useItemActions.ts";
import {ProfilePageView} from "../../../models/enums/ProfilePageView.ts";
import type {UpdateItem} from "../../../models/item/UpdateItem.ts";
import {useModal} from "../../../hooks/shared/useModal.ts";
import {usePaginatedQuery} from "../../../hooks/shared/usePaginatedQuery.ts";
import type {PaginationView} from "../../../models/pagiantion/PaginationView.ts";
import {useMutation} from "../../../hooks/shared/useMutation.ts";
import type {CreateItem} from "../../../models/item/CreateItem.ts";

const UserProfilePage: FC = () => {
    const {user, loadUser, logoutUser, isAuthority} = useAuth();
    const userRole = user?.role;

    const [pageView, setPageView] = useState<ProfilePageView>(
        isAuthority
            ? ProfilePageView.USERS
            : ProfilePageView.ITEMS,
    );

    const {
        activeModal,
        selected,
        openModal,
        closeModal,
    } = useModal<ItemAdminView | UserAdminView>();

    const openBecomeModal = () =>
        openModal('become');

    const openCreateModal = () =>
        openModal('create');

    const openUpdateItemModal = (item: ItemAdminView) =>
        openModal('updateItem', item);

    const openDeleteItemModal = (item: ItemAdminView) =>
        openModal('deleteItem', item);

    const openUpdateUserModal = (user: UserAdminView) =>
        openModal('updateUser', user);

    const openUpdateMyProfileModal = (user: UserAdminView) =>
        openModal('updateMyProfile', user);

    const openDeleteUserModal = (user: UserAdminView) =>
        openModal('deleteUser', user);

    const openDeleteMyProfileModal = (user: UserAdminView) =>
        openModal('deleteMyProfile', user);

    const openHardDeleteModal = (user: UserAdminView) =>
        openModal('hardDeleteUser', user);

    const {
        query,
        setQuery,
        data,
        isLoading,
        error,
        refetch,
        handlePageChange,
    } = usePaginatedQuery<
        PaginationView<ItemAdminView | UserAdminView>
    >(
        'profilePage',
        query => {
            const params = {
                page: query.page,
                perPage: query.perPage,
            };

            const sortDirection =
                query.sortDirection as
                    | 'asc'
                    | 'desc'
                    | undefined;

            const roleOrThrow = (role: boolean) => {
                if (!role) {
                    throw new Error('Invalid query state');
                }
            };

            switch (pageView) {
                case ProfilePageView.ITEMS:
                    roleOrThrow(userRole === 'SELLER');

                    return getMy({
                        ...params,
                        sortBy:
                            query.sortBy as
                                | ItemSortField
                                | undefined,
                        sortDirection,
                        search: query.search ?? undefined,
                    });

                case ProfilePageView.USERS:
                    roleOrThrow(isAuthority);

                    return getAll({
                        ...params,
                        sortBy:
                            query.sortBy as
                                | UserSortField
                                | undefined,
                        sortDirection,
                        search: query.search ?? undefined,
                    });

                case ProfilePageView.FLAGGED:
                    roleOrThrow(isAuthority);
                    return getFlagged(params);

                case ProfilePageView.BANNED:
                    roleOrThrow(isAuthority);
                    return getBanned(params);

                case ProfilePageView.MANAGERS:
                    roleOrThrow(userRole === 'ADMIN');
                    return getManagers(params);
            }
        },
        [pageView, userRole],
        8,
        {enabled: !!userRole},
    );

    const {
        data: stats,
        isLoading: statsLoading,
        error: statsError,
        refetch: refetchStats,
    } = useQuery<ProfileStats>({
        queryKey: ['profileStats', user?.publicId],
        queryFn: loadStats,
        enabled: !!user,
    });

    const {fetch, isMutating, ...snackbar} = useMutation(refetch);

    const {
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
    } = useUserActions();

    const {
        createItem,
        updateItem,
        deleteItem,
    } = useItemActions();

    const handleUpdateProfile = (
        dto: UpdateUserReq,
    ): Promise<void> => {
        if (activeModal !== 'updateMyProfile' || !selected) return Promise.resolve();

        return fetch(
            () => updateProfile(dto),
            'Profile updated!',
            loadUser,
        );
    };

    const handleAdminUpdateUser = (
        dto: UpdateUserReq,
    ): Promise<void> => {
        if (activeModal !== 'updateUser' || !selected) return Promise.resolve();

        return fetch(
            () => updateUser(selected.publicId, dto),
            'User updated!',
        );
    };

    const handleDeleteUser = (password: string): Promise<void> => {
        if (activeModal !== 'deleteUser' || !selected) {
            return Promise.resolve();
        }

        return fetch(
            () => deleteUser(selected.publicId, password),
            'User deleted!',
            async () => {
                closeModal();
                await refetchStats();
            },
        );
    };

    const handleHardDeleteUser = (password: string): Promise<void> => {
        if (activeModal !== 'hardDeleteUser' || !selected) {
            return Promise.resolve();
        }

        return fetch(
            () => hardDeleteUser(selected.publicId, password),
            'User permanently deleted!',
            async () => {
                closeModal();
                await refetchStats();
            },
        );
    };

    const handleUpdateItem = (
        dto: UpdateItem,
    ): Promise<void> => {
        if (activeModal !== 'updateItem' || !selected) return Promise.resolve();

        return fetch(
            () => updateItem(selected.publicId, dto),
            'Item updated!',
            closeModal,
        );
    };

    const handleDeleteItem = (password: string): Promise<void> => {
        if (activeModal !== 'deleteItem' || !selected) return Promise.resolve();

        return fetch(
            () => deleteItem(selected.publicId, password),
            'Item deleted!',
            async () => {
                closeModal();
                await refetchStats();
            },
        );
    };

    const handleBecomeSeller = (
        dto: BecomeSellerReq,
    ): Promise<void> => {
        if (activeModal !== 'become') return Promise.resolve();

        return fetch(
            () => onBecomeSeller(dto),
            'Switched to seller',
            async () => {
                closeModal();
                loadUser();
                await refetchStats();
            },
        );
    };

    const handleDeleteProfile = (password: string): Promise<void> => {
        if (activeModal !== 'deleteMyProfile') return Promise.resolve();

        return fetch(
            () => deleteProfile(password),
            'Profile deleted',
            logoutUser,
        );
    };

    const handleCreateItem = (
        dto: CreateItem,
    ): Promise<void> =>
        fetch(
            () => createItem(dto),
            'Item created!',
            async () => {
                closeModal();
                await refetchStats();
            },
        );

    const handleToggleBan = (
        user: UserAdminView,
    ): Promise<void> =>
        fetch(
            () => toggleBan(user),
            user.isBanned ? 'User unbanned!' : 'User banned!',
        );

    const handleTogglePromote = (
        user: UserAdminView,
    ): Promise<void> =>
        fetch(
            () => togglePromote(user),
            user.role === 'MANAGER'
                ? 'Manager demoted!'
                : 'User promoted!',
        );

    const handleUnflagUser = (
        user: UserAdminView,
    ): Promise<void> =>
        fetch(
            () => unflagUser(user),
            'User unflagged!',
        );

    const handleRestoreUser = (
        user: UserAdminView,
    ): Promise<void> =>
        fetch(
            () => restoreUser(user),
            'User restored!',
            async () => {
                closeModal();
                await refetchStats();
            },
        );

    const changeView = (view: ProfilePageView) => {
        setPageView(view);
        setQuery({page: 1});
    };

    const fileInputRef =
        useRef<HTMLInputElement>(null);

    const handleUploadAvatar = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        const file = e.target.files?.[0];

        if (!file) return;
        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) throw new Error('Avatar must be PNG or JPEG');
        if (file.size > MAX_AVATAR_SIZE) throw new Error('Avatar size must not be gt 5 MB');

        await fetch(
            () => changeAvatar(file),
            'Avatar changed!',
            loadUser,
        );

        e.target.value = '';
    };

    if (!user) return null;
    if (isMutating) return <PreloaderComponent/>;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >

            <UserProfileComponent
                user={user}
                openBecomeModal={openBecomeModal}
                openCreateModal={openCreateModal}
                openUpdateModal={
                    openUpdateMyProfileModal
                }
                openDeleteModal={
                    openDeleteMyProfileModal
                }
                changeView={changeView}
                stats={stats}
                error={statsError}
                loading={statsLoading}
                onUploadAvatar={handleUploadAvatar}
                onAvatarChange={handleAvatarChange}
                fileInputRef={fileInputRef}
            />

            {userRole === 'SELLER' &&
                pageView === ProfilePageView.ITEMS && (
                    <SellerView
                        query={query as ItemQueryParams}
                        setQuery={setQuery}
                        items={
                            data as PaginationView<ItemAdminView>
                        }
                        loading={isLoading}
                        error={error}
                        handlePageChange={handlePageChange}
                        openUpdateModal={
                            openUpdateItemModal
                        }
                        openDeleteModal={
                            openDeleteItemModal
                        }
                    />
                )}

            {isAuthority &&
                pageView !== ProfilePageView.ITEMS && (
                    <AdminView
                        query={query as UserQueryParams}
                        setQuery={setQuery}
                        users={
                            data as PaginationView<UserAdminView>
                        }
                        loading={isLoading}
                        error={error}
                        openUpdateModal={
                            openUpdateUserModal
                        }
                        openDeleteModal={
                            openDeleteUserModal
                        }
                        openHardDeleteModal={
                            openHardDeleteModal
                        }
                        toggleBan={handleToggleBan}
                        togglePromote={handleTogglePromote}
                        unflagUser={handleUnflagUser}
                        restoreUser={handleRestoreUser}
                        handlePageChange={
                            handlePageChange
                        }
                    />
                )}

            {userRole === 'BUYER' && (
                <>
                    <UpdateUserModal
                        open={activeModal === 'updateMyProfile'}
                        closeModal={closeModal}
                        onUpdateUser={handleUpdateProfile}
                        selectedUser={selected as UserAdminView}
                    />

                    <ConfirmDeleteModal
                        open={activeModal === 'deleteMyProfile'}
                        closeModal={closeModal}
                        deleteEntity={handleDeleteProfile}
                    />

                    <BecomeSellerModal
                        open={activeModal === 'become'}
                        closeModal={closeModal}
                        onBecomeSeller={handleBecomeSeller}
                    />
                </>
            )}

            {(userRole !== 'BUYER') && (
                <>
                    <UpdateUserModal
                        open={
                            userRole === 'SELLER'
                                ? activeModal === 'updateMyProfile'
                                : activeModal === 'updateUser'
                        }
                        closeModal={closeModal}
                        onUpdateUser={
                            userRole === 'SELLER'
                                ? handleUpdateProfile
                                : handleAdminUpdateUser
                        }
                        selectedUser={selected as UserAdminView}
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
                                ? handleDeleteProfile
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
                        onCreateItem={handleCreateItem}
                    />

                    <UpdateItemModal
                        open={activeModal === 'updateItem'}
                        closeModal={closeModal}
                        updateItem={handleUpdateItem}
                        selectedItem={selected as ItemAdminView}
                    />
                </>
            )}

            <InfoSnackbar
                open={snackbar.open}
                setOpen={snackbar.close}
                text={snackbar.text}
                status={snackbar.status}
            />
        </Box>
    );
};

export default UserProfilePage;