import {type FC, useState} from 'react';
import UsersComponent from '../../components/user/UsersComponent.tsx';
import {PaginationComponent} from '../../components/shared/PaginationComponent.tsx';
import {getAll} from '../../../services/fetch/user.service.ts';
import {NumberParam, StringParam, useQueryParams, withDefault} from 'use-query-params';
import {UserSortField} from '../../../models/enums/UserSortField.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import {Box} from '@mui/material';
import SortSearchComponent from '../../components/shared/SortSearchComponent.tsx';
import type {ActiveModal} from '../../../models/item/ActiveModal.ts';
import type {UserAdminView} from '../../../models/user/UserAdminView.ts';
import {createOpenModal} from '../../../helpers/createOpenModal.ts';
import type {UpdateUserDto} from '../../../models/user/UpdateUserDto.ts';
import UpdateUserModal from '../../components/modals/UpdateUserModal.tsx';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.tsx';
import {
    ban,
    demote,
    hardDelete,
    promote,
    restore,
    softDelete,
    unban,
    unflag,
    update,
} from '../../../services/fetch/admin.service.ts';
import {useQuery} from '@tanstack/react-query';
import type {QueryParams} from "../../../models/pagiantion/QueryParams.ts";
import {useMutationHandler} from "../../../helpers/handleMutation.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import PreloaderComponent from "../../components/shared/PreloaderComponent.tsx";

const UsersPage: FC = () => {
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [selectedUser, setSelectedUser] = useState<UserAdminView | null>(null);

    const openUserModal = createOpenModal<UserAdminView>(setActiveModal, setSelectedUser);
    const openUpdateModal = (user: UserAdminView) => openUserModal('updateUser', user);
    const openDeleteModal = (user: UserAdminView) => openUserModal('deleteUser', user);
    const openHardDeleteModal = (user: UserAdminView) => openUserModal('hardDeleteUser', user);
    const closeModal = () => setActiveModal(null);

    const [query, setQuery] = useQueryParams({
        page: withDefault(NumberParam, 1),
        perPage: withDefault(NumberParam, 8),
        sortBy: StringParam,
        sortDirection: StringParam,
        search: StringParam,
    });

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            'users',
            query.page,
            query.perPage,
            query.sortBy,
            query.sortDirection,
            query.search,
        ],
        queryFn: () =>
            getAll({
                page: query.page,
                perPage: query.perPage,
                sortBy: query.sortBy as UserSortField | undefined,
                sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
                search: query.search ?? undefined,
            }),
    });

    const {
        isMutating,
        openSnackbar,
        setOpenSnackbar,
        snackbarText,
        snackbarStatus,
        handleMutation,
    } = useMutationHandler(refetch);

    const updateUser = async (dto: UpdateUserDto) => {
        if (!selectedUser) return;
        await handleMutation(
            async () => {
                await update(selectedUser.publicId, dto)
            }, 'User updated');
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

    const handlePageChange = (newPage: number) => {
        setQuery({page: newPage});
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>

            {isLoading && <PreloaderComponent/>}

            <SortSearchComponent
                query={query as QueryParams<UserSortField>}
                setQuery={setQuery}
                fields={Object.values(UserSortField)}
            />

            <DataStateComponent
                data={data}
                error={error}
                loading={isLoading || isMutating}
                isEmpty={data?.data.length === 0}>
                {data &&
                    <>
                        <UsersComponent
                            users={data.data}
                            openDeleteModal={openDeleteModal}
                            openHardDeleteModal={openHardDeleteModal}
                            openUpdateModal={openUpdateModal}
                            toggleBan={toggleBan}
                            togglePromote={togglePromote}
                            unflagUser={unflagUser}
                            restoreUser={restoreUser}
                        />
                        <PaginationComponent
                            page={data.page}
                            pageCount={data.pageCount}
                            onChange={handlePageChange}

                        />
                    </>
                }
            </DataStateComponent>

            <UpdateUserModal
                open={activeModal === 'updateUser'}
                closeModal={closeModal}
                onUpdateUser={updateUser}
                selectedUser={selectedUser}
            />

            <ConfirmDeleteModal
                open={activeModal === 'deleteUser' || activeModal === 'hardDeleteUser'}
                closeModal={closeModal}
                deleteEntity={
                    activeModal === 'deleteUser'
                        ? deleteUser
                        : hardDeleteUser
                }
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

export default UsersPage;