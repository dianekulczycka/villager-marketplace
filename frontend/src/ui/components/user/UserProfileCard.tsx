import type { FC } from 'react';
import { Avatar, Box, Chip, Divider, Typography } from '@mui/material';
import type { UserSelfView } from '../../../models/user/UserSelfView.ts';
import { routes } from '../../../routes/routes.ts';

interface Props {
  user: UserSelfView;
}

const UserProfileCard: FC<Props> = ({ user }) => {
  return (
    <>
      <Avatar
        src={routes.icons.user(user.iconUrl)}
        alt={user.username}
        sx={{
          width: 120,
          height: 120,
          border: '3px solid #eee',
        }}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {user.username}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          id: {user.id}
        </Typography>

        <Typography variant="body1" gutterBottom>
          Email: {user.email}
        </Typography>

        <Typography variant="body1" gutterBottom>
          Role: {user.role}
        </Typography>

        {user.sellerType && (
          <Typography variant="body1" gutterBottom>
            Seller Type: {user.sellerType}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Since: {new Date(user.createdAt).toLocaleString()}
        </Typography>

        {!!user.isBanned && (
          <>
            <Divider sx={{ my: 2 }} />
            <Chip
              label={`Banned at: ${
                user.bannedAt
                  ? new Date(user.bannedAt).toLocaleString()
                  : 'unknown'
              }`}
              color="error"
            />
          </>
        )}
      </Box>
    </>
  );
};

export default UserProfileCard;