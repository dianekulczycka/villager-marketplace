import { type FC } from 'react';
import type { UserPublicView } from '../../../models/user/UserPublicView.ts';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../routes/routes.ts';

interface Props {
  user: UserPublicView;
}

const UserComponent: FC<Props> = ({ user }) => {
  return (
    <Card
      component={RouterLink}
      to={routes.items.bySellerId(user.id)}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 3,
        overflow: 'hidden',
        transition: '0.2s',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={`http://localhost:3003/icons/user/${user.iconUrl}`}
        alt={user.username}
        sx={{
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
        }}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {user.username}
        </Typography>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {user.sellerType}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Since {user.createdAt.slice(0, 10)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserComponent;