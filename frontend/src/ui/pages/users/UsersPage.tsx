import {type FC} from 'react';
import UsersComponent from '../../components/user/UsersComponent.tsx';
import {PaginationComponent} from '../../components/shared/PaginationComponent.tsx';
import {getAll} from '../../../services/fetch/user.service.ts';
import {UserSortField} from '../../../models/enums/UserSortField.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import {Box} from '@mui/material';
import SortSearchComponent from '../../components/shared/SortSearchComponent.tsx';
import type {UserAdminView} from '../../../models/user/UserAdminView.ts';
import type {UpdateUserDto} from '../../../models/user/UpdateUserDto.ts';
import UpdateUserModal from '../../components/modals/UpdateUserModal.tsx';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal.tsx';
import type {QueryParams} from "../../../models/pagiantion/QueryParams.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import {useUserActions} from "../../../hooks/actions/useUserActions.ts";
import {useModal} from "../../../hooks/shared/useModal.ts";
import {usePaginatedQuery} from "../../../hooks/shared/usePaginatedQuery.ts";
import type {PaginationView} from "../../../models/pagiantion/PaginationView.ts";
import {useMutation} from "../../../hooks/shared/useMutation.ts";

const UsersPage: FC = () => {
    const {
        activeModal,
        selected: selectedUser,
        closeModal,
        createOpenFn,
    } = useModal<UserAdminView>();

    const openUpdateModal = createOpenFn('updateUser');
    const openDeleteModal = createOpenFn('deleteUser');
    const openHardDeleteModal = createOpenFn('hardDeleteUser');

    const {
        query,
        setQuery,
        data,
        isLoading,
        error,
        refetch,
        handlePageChange,
    } = usePaginatedQuery<PaginationView<UserAdminView>>(
        'users',
        query =>
            getAll({
                page: query.page,
                perPage: query.perPage,
                sortBy:
                    query.sortBy as UserSortField | undefined,
                sortDirection:
                    query.sortDirection as
                        | 'asc'
                        | 'desc'
                        | undefined,
                search: query.search ?? undefined,
            }),
    );

    const {
        fetch,
        isMutating,
        open,
        close,
        text,
        status,
    } = useMutation(refetch);

    const {
        updateUser,
        deleteUser,
        hardDeleteUser,
        toggleBan,
        togglePromote,
        unflagUser,
        restoreUser,
    } = useUserActions();

    const handleUpdateUser = async (
        dto: UpdateUserDto,
    ): Promise<void> => {
        if (!selectedUser) return;

        await fetch(
            () => updateUser(selectedUser.publicId, dto),
            'User updated!',
        );
    };

    const handleDeleteUser = async (): Promise<void> => {
        if (!selectedUser) return;

        await fetch(
            () => deleteUser(selectedUser.publicId),
            'User deleted!',
        );

        closeModal();
    };

    const handleHardDeleteUser = async (): Promise<void> => {
        if (!selectedUser) return;

        await fetch(
            () => hardDeleteUser(selectedUser.publicId),
            'User permanently deleted!',
        );

        closeModal();
    };

    const handleToggleBan = async (
        user: UserAdminView,
    ): Promise<void> => {
        await fetch(
            () => toggleBan(user),
            user.isBanned ? 'User unbanned!' : 'User banned!',
        );
    };

    const handleTogglePromote = async (
        user: UserAdminView,
    ): Promise<void> => {
        await fetch(
            () => togglePromote(user),
            user.role === 'MANAGER'
                ? 'Manager demoted!'
                : 'User promoted!',
        );
    };

    const handleUnflagUser = async (
        user: UserAdminView,
    ): Promise<void> => {
        if (!user.isFlagged) return;

        await fetch(
            () => unflagUser(user),
            'User unflagged!',
        );
    };

    const handleRestoreUser = async (
        user: UserAdminView,
    ): Promise<void> => {
        if (!user.isDeleted) return;

        await fetch(
            () => restoreUser(user),
            'User restored!',
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <SortSearchComponent
                query={query as QueryParams<UserSortField>}
                setQuery={setQuery}
                fields={Object.values(UserSortField)}
            />

            <DataStateComponent
                data={data}
                error={error}
                emptyMessage={"No users found"}
                loading={isLoading || isMutating}
                isEmpty={data?.data.length === 0}
            >
                {data && (
                    <>
                        <UsersComponent
                            users={data.data}
                            openDeleteModal={openDeleteModal}
                            openHardDeleteModal={openHardDeleteModal}
                            openUpdateModal={openUpdateModal}
                            toggleBan={handleToggleBan}
                            togglePromote={handleTogglePromote}
                            unflagUser={handleUnflagUser}
                            restoreUser={handleRestoreUser}
                        />

                        <PaginationComponent
                            page={data.page}
                            pageCount={data.pageCount}
                            onChange={handlePageChange}
                        />
                    </>
                )}
            </DataStateComponent>

            <UpdateUserModal
                open={activeModal === 'updateUser'}
                closeModal={closeModal}
                onUpdateUser={handleUpdateUser}
                selectedUser={selectedUser}
            />

            <ConfirmDeleteModal
                open={
                    activeModal === 'deleteUser' ||
                    activeModal === 'hardDeleteUser'
                }
                closeModal={closeModal}
                deleteEntity={
                    activeModal === 'deleteUser'
                        ? handleDeleteUser
                        : handleHardDeleteUser
                }
            />

            <InfoSnackbar
                open={open}
                setOpen={close}
                text={text}
                status={status}
            />
        </Box>
    );
};

export default UsersPage;