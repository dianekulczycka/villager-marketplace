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
import {useMutationHandler} from "../../../hooks/useMutationHandler.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import PreloaderComponent from "../../components/shared/PreloaderComponent.tsx";
import {useAdminUserActions} from "../../../hooks/useAdminUserActions.ts";
import {useModalState} from "../../../hooks/useModalState.ts";
import {usePaginatedQuery} from "../../../hooks/usePaginatedQuery.ts";
import type {PaginationRes} from "../../../models/pagiantion/PaginationRes.ts";

const UsersPage: FC = () => {
    const {
        activeModal,
        selected: selectedUser,
        closeModal,
        createOpenFn,
    } = useModalState<UserAdminView>();

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
    } = usePaginatedQuery<PaginationRes<UserAdminView>>(
        'users',
        (query) =>
            getAll({
                page: query.page,
                perPage: query.perPage,
                sortBy: query.sortBy as UserSortField | undefined,
                sortDirection: query.sortDirection as 'asc' | 'desc' | undefined,
                search: query.search ?? undefined,
            }),
    );

    const {
        isMutating,
        openSnackbar,
        setOpenSnackbar,
        snackbarText,
        snackbarStatus,
        handleMutation,
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
                onUpdateUser={handleUpdateUser}
                selectedUser={selectedUser}
            />

            <ConfirmDeleteModal
                open={activeModal === 'deleteUser' || activeModal === 'hardDeleteUser'}
                closeModal={closeModal}
                deleteEntity={
                    activeModal === 'deleteUser'
                        ? handleDeleteUser
                        : handleHardDeleteUser
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