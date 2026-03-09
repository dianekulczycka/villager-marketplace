import { type FC } from 'react';
import UserProfileCard from './UserProfileCard.tsx';
import { Box, Card, CardContent } from '@mui/material';
import ActionButton from '../buttons/ActionButton.tsx';
import type { UserAdminView } from '../../../models/user/UserAdminView.ts';

interface Props {
  user: UserAdminView;
  openBecomeModal: () => void;
  openCreateModal: () => void;
  openDeleteUserModal: (user: UserAdminView) => void;
  openUpdateUserModal: (user: UserAdminView) => void;
}

const UserProfileComponent: FC<Props> = ({
                                           user,
                                           openBecomeModal,
                                           openCreateModal,
                                           openUpdateUserModal,
                                           openDeleteUserModal,
                                         }) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mt: 4,
      }}
    >
      <Card
        sx={{
          width: { xs: '95%', md: '75%' },
          p: 3,
          borderRadius: 3,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 4,
            alignItems: { xs: 'center', sm: 'flex-start' },
          }}
        >
          <UserProfileCard user={user} />

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {user.role !== 'ADMIN' && user.role !== 'MANAGER' && (
              <ActionButton action="Edit profile" actionHandler={() => openUpdateUserModal(user)} />)}
            {user.role !== 'ADMIN' &&
              <ActionButton action="Delete profile" actionHandler={() => openDeleteUserModal(user)} />}
            {user.role === 'BUYER' && <ActionButton action="Become seller" actionHandler={openBecomeModal} />}
            {user.role === 'SELLER' && <ActionButton action="New post" actionHandler={openCreateModal} />}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfileComponent;