import { type FC } from 'react';
import type { UserPublicView } from '../../../models/user/UserPublicView.ts';
import { Box } from '@mui/material';
import UserCard from './UserCard.tsx';

interface Props {
  users: UserPublicView[];
}

const UsersComponent: FC<Props> = ({ users }) => {
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
        users.map((user) => <UserCard key={user.id} user={user} variant="L" />)
      }
    </Box>
  );
};

export default UsersComponent;