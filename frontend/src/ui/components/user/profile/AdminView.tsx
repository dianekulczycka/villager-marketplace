import type { UserQueryParams } from '../../../../models/user/UserQueryParams.ts';
import type { PaginationRes } from '../../../../models/pagiantion/PaginationRes.ts';
import type { FC } from 'react';
import SortSearchComponent from '../../shared/SortSearchComponent.tsx';
import DataStateComponent from '../../shared/DataStateComponent.tsx';
import { PaginationComponent } from '../../shared/PaginationComponent.tsx';
import type { UserAdminView } from '../../../../models/user/UserAdminView.ts';
import UsersComponent from '../UsersComponent.tsx';
import { UserSortField } from '../../../../models/enums/UserSortField.ts';

interface Props {
  query: UserQueryParams;
  setQuery: (q: Partial<UserQueryParams>) => void;
  users: PaginationRes<UserAdminView> | null;
  loading: boolean;
  error: Error | null;
  openDeleteModal: (user: UserAdminView) => void;
  openUpdateModal: (user: UserAdminView) => void;
  openHardDeleteModal: (user: UserAdminView) => void;
  toggleBan: (user: UserAdminView) => void;
  togglePromote: (user: UserAdminView) => void;
  unflagUser: (user: UserAdminView) => void;
  restoreUser: (user: UserAdminView) => void;
}

const AdminView: FC<Props> = ({
                                query,
                                setQuery,
                                users,
                                loading,
                                error,
                                openDeleteModal,
                                openUpdateModal,
                                toggleBan,
                                togglePromote,
                                unflagUser,
                                restoreUser,
                                openHardDeleteModal,
                              }) => {

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  return (
    <>
      <SortSearchComponent fields={Object.values(UserSortField)} />
      <DataStateComponent
        loading={loading}
        error={error}
        data={users}
        isEmpty={users?.data.length === 0}
      >
        {users && (
          <>
            <UsersComponent
              users={users.data}
              openUpdateModal={openDeleteModal}
              openDeleteModal={openUpdateModal}
              openHardDeleteModal={openHardDeleteModal}
              toggleBan={toggleBan}
              togglePromote={togglePromote}
              unflagUser={unflagUser}
              restoreUser={restoreUser}
            />
            <PaginationComponent
              page={query.page!}
              pageCount={users.pageCount}
              onChange={handlePageChange}
            />
          </>
        )}
      </DataStateComponent>
    </>
  );
};

export default AdminView;