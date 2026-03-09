import type { FC } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../routes/routes.ts';
import Controllers from '../buttons/Controllers.tsx';
import { useAuth } from '../../../store/helpers/useAuth.ts';
import type { UserAdminView } from '../../../models/user/UserAdminView.ts';

interface UserCardProps {
  user: UserAdminView;
  variant?: 'L' | 'S';
  openDeleteModal: (user: UserAdminView) => void;
  openUpdateModal: (user: UserAdminView) => void;
}

const UserCard: FC<UserCardProps> = ({
                                       user,
                                       variant,
                                       openDeleteModal,
                                       openUpdateModal,
                                     }) => {
  const { user: loggedUser } = useAuth();
  const canModify: boolean = loggedUser?.role === 'ADMIN' || loggedUser?.role === 'MANAGER';
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
        ...(!!user.isDeleted && {
          opacity: 0.7,
        }),
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
          {user.role === 'SELLER' ? user.sellerType : user.role}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Registered: {new Date(user.createdAt).toLocaleDateString()}
        </Typography>

        {variant === 'L' && (
          <>
            {!!user.isBanned && (
              <>
                <Typography variant="caption" color="text.secondary">
                  Banned at: {new Date(user.bannedAt!).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Banned by: {user.bannedBy}
                </Typography>
              </>
            )}

            {!!user.isDeleted && (
              <>
                <Typography variant="caption" color="text.secondary">
                  Deleted at: {new Date(user.deletedAt!).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Deleted by: {user.deletedBy}
                </Typography>
              </>
            )}
          </>
        )}
      </Box>
      {variant === 'L' && canModify && !user.isDeleted && <Controllers
        openDeleteModal={openDeleteModal}
        openUpdateModal={openUpdateModal}
        element={user}
      />}
    </Card>
  );
};

export default UserCard;