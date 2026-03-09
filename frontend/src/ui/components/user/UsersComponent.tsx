import { type FC } from 'react';
import { Box } from '@mui/material';
import UserCard from './UserCard.tsx';
import type { UserAdminView } from '../../../models/user/UserAdminView.ts';

interface Props {
  users: UserAdminView[];
  openDeleteModal: (user: UserAdminView) => void;
  openUpdateModal: (user: UserAdminView) => void;
}

const UsersComponent: FC<Props> = ({
                                     users,
                                     openDeleteModal,
                                     openUpdateModal,
                                   }) => {
  return (
    <Box
      sx={{
        width: '66%',
        margin: '0 auto',
        mt: 4,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 3,
      }}>
      {
        users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            openDeleteModal={openDeleteModal}
            openUpdateModal={openUpdateModal}
            variant="L" />
          ))
      }
    </Box>
  );
};

export default UsersComponent;