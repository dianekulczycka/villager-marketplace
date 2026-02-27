import { type FC } from 'react';
import { AppBar, Avatar, Button, Link, Toolbar } from '@mui/material';
import { useAuth } from '../../../store/helpers/useAuth.ts';
import { Link as RouterLink, useNavigate } from 'react-router';
import ErrorComponent from '../error/ErrorComponent.tsx';
import { routes } from '../../../routes/routes.ts';

export const HeaderComponent: FC = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logoutUser();
    navigate(`${routes.auth.root}/${routes.auth.login}`);
  };

  if (!user) return <ErrorComponent error="no user" />;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#e7fdf4',
        color: '#333',
        boxShadow: '0 20px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: 2,
        }}>
        <Link
          component={RouterLink}
          to={routes.items.root}
          underline="hover"
        >
          Items
        </Link>
        <Link
          component={RouterLink}
          to={routes.users.root}
          underline="hover"
        >
          Users
        </Link>
      </Toolbar>
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <>
          <Avatar
            component={RouterLink}
            to={`${routes.users.root}/${routes.users.me}`}
            src={routes.icons.user(user.iconUrl)}
            alt={user.username}
            sx={{
              width: 42,
              height: 42,
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          />

          <Button
            variant="outlined"
            size="small"
            onClick={handleLogout}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '8px',
              paddingX: 2,
            }}
          >
            log out
          </Button>
        </>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderComponent;