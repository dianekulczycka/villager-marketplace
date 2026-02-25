import { type FC } from 'react';
import UserComponent from './UserComponent.tsx';
import type { UserPublicView } from '../../../models/user/UserPublicView.ts';
import { Box } from '@mui/material';

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
        users.map((user) => <UserComponent key={user.id} user={user} />)
      }
    </Box>
  );
};

export default UsersComponent;