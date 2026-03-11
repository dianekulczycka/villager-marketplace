import { Box } from '@mui/material';
import ActionButton from './ActionButton.tsx';
import type { UserAdminView } from '../../../models/user/UserAdminView.ts';
import type { FC } from 'react';
import { useAuth } from '../../../store/helpers/useAuth.ts';

interface Props {
  user: UserAdminView;
  openHardDeleteModal: (user: UserAdminView) => void;
  toggleBan: (user: UserAdminView) => void;
  togglePromote: (user: UserAdminView) => void;
  unflagUser: (user: UserAdminView) => void;
  restoreUser: (user: UserAdminView) => void;
}

const UserAdminControllers: FC<Props> = ({
                                           toggleBan,
                                           togglePromote,
                                           unflagUser,
                                           restoreUser,
                                           openHardDeleteModal,
                                           user,
                                         }) => {

  const { user: loggedUser } = useAuth();
  const isAdmin = loggedUser?.role === 'ADMIN';
  const isManager = loggedUser?.role === 'MANAGER';
  const isAuthority = isAdmin || isManager;
  const isDeleted = user.isDeleted;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        marginLeft: '1rem',
      }}
    >
      {isAuthority && !isDeleted && (
        <>
          <ActionButton actionHandler={() => toggleBan(user)} action={user.isBanned ? 'unban' : 'ban'} />
          {!!user.isFlagged && <ActionButton actionHandler={() => unflagUser(user)} action="unflag" />}
        </>
      )}
      {isAdmin && !isDeleted && (
        <>
          <ActionButton actionHandler={() => togglePromote(user)}
                        action={user.role === 'MANAGER' ? 'demote' : 'promote'} />
          <ActionButton actionHandler={() => openHardDeleteModal(user)} action="hard delete" />
        </>
      )}
      {isAuthority && !!isDeleted && (
        <ActionButton actionHandler={() => restoreUser(user)} action="restore" />
      )}
    </Box>
  );
};

export default UserAdminControllers;