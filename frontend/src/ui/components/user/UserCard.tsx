import type { FC } from 'react';
import { Box, Card, Typography } from '@mui/material';
import type { UserPublicView } from '../../../models/user/UserPublicView.ts';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../routes/routes.ts';
interface UserCardProps {
  user: UserPublicView;
  variant?: 'L' | 'S';
}

const UserCard: FC<UserCardProps> = ({ user, variant }) => {
  // const { user: loggedUser } = useAuth();
  // const canModify: boolean = loggedUser?.role === 'ADMIN' || loggedUser?.role === 'MANAGER';
  const isSmall = variant === 'S';

  return (
    <Card
      elevation={isSmall ? 0 : 1}
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        transition: '0.25s ease',
        display: 'flex',
        flexDirection: isSmall ? 'row' : 'column',
        alignItems: isSmall ? 'center' : undefined,
        gap: isSmall ? 2 : 0,
        p: isSmall ? 2 : 0,
        height: isSmall ? 'auto' : '100%',
        '&:hover': {
          transform: isSmall ? 'none' : 'translateY(-6px)',
          boxShadow: isSmall ? 3 : 6,
        },
      }}
    >
      <Box
        component="img"
        src={routes.icons.user(user.iconUrl)}
        alt={user.username}
        sx={{
          width: isSmall ? 48 : '100%',
          height: isSmall ? 48 : 220,
          borderRadius: isSmall ? '50%' : 0,
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
          flexShrink: 0,
        }}
      />

      <Box
        component={RouterLink}
        to={routes.items.bySellerId(user.id)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          p: isSmall ? 0 : 2,
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <Typography variant={isSmall ? 'body2' : 'h6'} fontWeight={600}>
          {user.username}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {user.sellerType}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Since {new Date(user.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
    </Card>
  );
};

export default UserCard;