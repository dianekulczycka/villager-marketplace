import {type FC} from 'react';
import {AppBar, Avatar, Box, Button, Link, Toolbar} from '@mui/material';
import {useAuth} from '../../../store/helpers/useAuth.ts';
import {Link as RouterLink} from 'react-router';
import ErrorComponent from '../error/ErrorComponent.tsx';
import {routes} from '../../../routes/routes.ts';
import {useAuthActions} from "../../../hooks/actions/useAuthActions.ts";

export const HeaderComponent: FC = () => {
    const {user, isAuthority} = useAuth();
    const {logout} = useAuthActions();

    if (!user) return <ErrorComponent error="no user"/>;

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: '#ffffff',
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
                {!isAuthority &&
                    <>
                        <Link
                            component={RouterLink}
                            to={routes.orders.root}
                            underline="hover"
                        >
                            Orders
                        </Link>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.75,
                            }}
                        >
                            <Link
                                component={RouterLink}
                                to={routes.chats.root}
                                underline="hover"
                            >
                                Chats
                            </Link>
                        </Box>
                    </>
                }
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
                        to={routes.users.me}
                        src={user.iconUrl}
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
                        onClick={logout}
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