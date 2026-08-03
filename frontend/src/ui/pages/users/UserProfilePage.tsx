import {type FC, useState} from 'react';
import UserProfileComponent from '../../components/user/UserProfileComponent.tsx';
import {useAuth} from '../../../store/helpers/useAuth.ts';
import {
    getMy,
    post,
    softDelete as itemSoftDelete,
    update as itemUpdate,
} from '../../../services/fetch/item.service.ts';
import {becomeSeller, getAll, stats as loadStats, update} from '../../../services/fetch/user.service.ts';
import {NumberParam, StringParam, useQueryParams, withDefault} from 'use-query-params';
import {ItemSortField} from '../../../models/enums/ItemSortField.ts';
import type {BecomeSellerDto} from '../../../models/user/BecomeSellerDto.ts';
import {Box} from '@mui/material';
import type {ActiveModal} from '../../../models/item/ActiveModal.ts';
import type {CreateItemDto} from '../../../models/item/CreateItemDto.ts';
import type {UpdateItemDto} from '../../../models/item/UpdateItemDto.ts';
import {createOpenModal} from '../../../helpers/createOpenModal.ts';
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
import {
    ban,
    demote,
    getBanned,
    getFlagged,
    getManagers,
    hardDelete,
    promote,
    restore,
    softDelete,
    unban,
    unflag,
} from '../../../services/fetch/admin.service.ts';
import type {ProfileStats} from '../../../models/stats/ProfileStats.ts';
import {useQuery} from '@tanstack/react-query';
import {useMutationHandler} from "../../../helpers/handleMutation.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import type {ItemQueryParams} from "../../../models/item/ItemQueryParams.ts";
import PreloaderComponent from "../../components/shared/PreloaderComponent.tsx";

export type PageView = 'ITEMS' | 'USERS' | 'BANNED_USERS' | 'FLAGGED_USERS' | 'MANAGERS';

const UserProfilePage: FC = () => {
    const {user, loadUser} = useAuth();
    const userRole = user?.role;
    const isAuthority = userRole === 'ADMIN' || userRole === 'MANAGER';

    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [selectedItem, setSelectedItem] = useState<ItemAdminView | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserAdminView | null>(null);
    const [pageView, setPageView] = useState<PageView>(
        isAuthority ? 'MANAGERS' : 'ITEMS'
    );
    const openItemModal = createOpenModal<ItemAdminView>(setActiveModal, setSelectedItem);
    const openUserModal = createOpenModal<UserAdminView>(setActiveModal, setSelectedUser);

    const openBecomeModal = () => openItemModal('become');
    const openCreateModal = () => openItemModal('create');
    const openUpdateItemModal = (item: ItemAdminView) => openItemModal('updateItem', item);
    const openDeleteItemModal = (item: ItemAdminView) => openItemModal('deleteItem', item);
    const openUpdateUserModal = (user: UserAdminView) => openUserModal('updateUser', user);
    const openDeleteUserModal = (user: UserAdminView) => openUserModal('deleteUser', user);
    const openHardDeleteModal = (user: UserAdminView) => openUserModal('hardDeleteUser', user);

    const closeModal = () => setActiveModal(null);

    const [query, setQuery] = useQueryParams({
        page: withDefault(NumberParam, 1),
        perPage: withDefault(NumberParam, 8),
        sortBy: StringParam,
        sortDirection: StringParam,
        search: StringParam,
    });

    const fetchPageData = () => {
        if (userRole === 'SELLER' && pageView === 'ITEMS') {
            return getMy({
                page: query.page,
                perPage: query.perPage,
                sortBy: query.sortBy as ItemSortField | undefined,
                sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
                search: query.search ?? undefined,
            });
        }

        if (isAuthority && pageView === 'USERS') {
            return getAll({
                page: query.page,
                perPage: query.perPage,
                sortBy: query.sortBy as UserSortField | undefined,
                sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
                search: query.search ?? undefined,
            });
        }

        if (isAuthority && pageView === 'FLAGGED_USERS') {
            return getFlagged({
                page: query.page,
                perPage: query.perPage,
            });
        }

        if (isAuthority && pageView === 'BANNED_USERS') {
            return getBanned({
                page: query.page,
                perPage: query.perPage,
            });
        }

        if (userRole === 'ADMIN' && pageView === 'MANAGERS') {
            return getManagers({
                page: query.page,
                perPage: query.perPage,
            });
        }
        throw new Error('Invalid query state');
    };

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery<PaginationRes<ItemAdminView | UserAdminView> | null>({
        queryKey: [
            'profilePage',
            pageView,
            userRole,
            query.page,
            query.perPage,
            query.sortBy,
            query.sortDirection,
            query.search,
        ],
        queryFn: fetchPageData,
        enabled: !!userRole,
    });

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

    const onBecomeSeller = async (data: BecomeSellerDto) => {
        await handleMutation(
            async () => {
                await becomeSeller(data);
                loadUser();
            },
            'Switched to seller',
        );
    };

    const createItem = async (data: CreateItemDto) => {
        await handleMutation(
            async () => {
                await post({
                    ...data,
                    description: data.description?.trim() || undefined,
                });
            },
            'Item created',
        );
    };

    const updateItem = async (dto: UpdateItemDto) => {
        if (!selectedItem) return;
        await handleMutation(
            async () => {
                await itemUpdate(selectedItem.publicId, dto);
            },
            'Item updated',
        );
    };

    const updateUser = async (dto: UpdateUserDto) => {
        if (!selectedUser) return;

        await handleMutation(
            async () => {
                await update(dto);
                loadUser();
            },
            'User updated',
        );
    };

    const deleteItem = async () => {
        if (!selectedItem) return;
        await handleMutation(
            async () => {
                await itemSoftDelete(selectedItem.publicId);
            }, 'Item deleted');
    };

    const deleteUser = async () => {
        if (!selectedUser) return;
        await handleMutation(
            async () => {
                await softDelete(selectedUser.publicId)
            }, 'User deleted');
    };

    const hardDeleteUser = async () => {
        if (!selectedUser) return;
        await handleMutation(
            async () => {
                await hardDelete(selectedUser.publicId)
            }, 'User hard deleted');
    };

    const toggleBan = async (user: UserAdminView) => {
        await handleMutation(
            async () => {
                await (user.isBanned
                    ? unban(user.publicId)
                    : ban(user.publicId));
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
        await handleMutation(
            async () => {
                if (user.isFlagged) {
                    await unflag(user.publicId)
                }
            }, 'User unflagged');
    };

    const restoreUser = async (user: UserAdminView) => {
        await handleMutation(
            async () => {
                if (user.isDeleted) {
                    await restore(user.publicId);
                }
            }, 'User restored');
    };

    const changeView = (view: PageView) => {
        setPageView(view);
        setQuery({page: 1});
    };

    if (!user) return null;

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>

            {isMutating && <PreloaderComponent />}

            <UserProfileComponent
                user={user}
                openBecomeModal={openBecomeModal}
                openCreateModal={openCreateModal}
                openUpdateUserModal={openUpdateUserModal}
                openDeleteUserModal={openDeleteUserModal}
                changeView={changeView}
                stats={stats}
                error={statsError}
                loading={statsLoading}
            />

            {userRole === 'SELLER' && pageView === 'ITEMS' && (
                <SellerView
                    query={query as ItemQueryParams}
                    setQuery={setQuery}
                    items={data as PaginationRes<ItemAdminView>}
                    loading={isLoading}
                    error={error}
                    openUpdateModal={openUpdateItemModal}
                    openDeleteModal={openDeleteItemModal}/>
            )}

            {isAuthority && pageView !== 'ITEMS' && (
                <AdminView
                    pageView={pageView}
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
                />)}

            <UpdateUserModal
                open={activeModal === 'updateUser'}
                closeModal={closeModal}
                onUpdateUser={updateUser}
                selectedUser={selectedUser}
            />

            <ConfirmDeleteModal
                open={
                    activeModal === 'deleteUser' ||
                    activeModal === 'hardDeleteUser' ||
                    activeModal === 'deleteItem'
                }
                closeModal={closeModal}
                deleteEntity={
                    activeModal === 'hardDeleteUser'
                        ? hardDeleteUser
                        : activeModal === 'deleteItem'
                            ? deleteItem
                            : deleteUser
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
                updateItem={updateItem}
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