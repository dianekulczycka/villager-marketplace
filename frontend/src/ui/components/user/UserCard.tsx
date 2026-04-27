import type {FC} from 'react';
import {Box, Card, Typography} from '@mui/material';
import {Link as RouterLink} from 'react-router-dom';
import {routes} from '../../../routes/routes.ts';
import Controllers from '../buttons/Controllers.tsx';
import {useAuth} from '../../../store/helpers/useAuth.ts';
import type {UserAdminView} from '../../../models/user/UserAdminView.ts';
import UserAdminControllers from '../buttons/UserAdminControllers.tsx';

interface Props {
    user: UserAdminView;
    variant?: 'L' | 'S';
    disabled?: boolean;
    openDeleteModal?: (user: UserAdminView) => void;
    openUpdateModal?: (user: UserAdminView) => void;
    openHardDeleteModal?: (user: UserAdminView) => void;
    toggleBan?: (user: UserAdminView) => void;
    togglePromote?: (user: UserAdminView) => void;
    unflagUser?: (user: UserAdminView) => void;
    restoreUser?: (user: UserAdminView) => void;
}

const UserCard: FC<Props> = ({
                                 user,
                                 variant,
                                 disabled,
                                 openDeleteModal,
                                 openUpdateModal,
                                 openHardDeleteModal,
                                 toggleBan,
                                 togglePromote,
                                 unflagUser,
                                 restoreUser,
                             }) => {
    const {user: loggedUser} = useAuth();
    const canModify: boolean = loggedUser?.role === 'ADMIN' || loggedUser?.role === 'MANAGER';
    const isSmall = variant === 'S';
    const isClickable = !canModify && !disabled;

    return (
        <Card
            component={isClickable ? RouterLink : 'div'}
            to={isClickable ? routes.items.bySellerId(user.id) : undefined}
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
                textDecoration: 'none',
                color: 'inherit',
                pointerEvents: isClickable ? 'auto' : 'none',
                opacity: disabled ? 0.5 : user.isDeleted ? 0.7 : 1,
                filter: disabled ? 'grayscale(0.5)' : 'none',
                cursor: disabled ? 'default' : 'pointer',
            }}
        >
            <Box
                component="img"
                src={routes.icons.user(user.iconUrl)}
                alt={user.username}
                sx={{
                    width: isSmall ? 48 : '100%',
                    height: isSmall ? 48 : 300,
                    borderRadius: isSmall ? '50%' : 0,
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                    flexShrink: 0,
                }}
            />

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    p: isSmall ? 0 : 2,
                    textDecoration: 'none',
                    color: 'inherit',
                    position: 'relative',
                    zIndex: 1,
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
            {variant === 'L' && canModify && (
                <Box sx={{pointerEvents: 'auto', mt: 'auto', pb: 2}}> <UserAdminControllers toggleBan={toggleBan!}
                                                                                            togglePromote={togglePromote!}
                                                                                            unflagUser={unflagUser!}
                                                                                            restoreUser={restoreUser!}
                                                                                            openHardDeleteModal={openHardDeleteModal!}
                                                                                            user={user}/> </Box>)}
            {variant === 'L' && canModify && !user.isDeleted && (
                <Box sx={{pointerEvents: 'auto'}}> <Controllers openDeleteModal={openDeleteModal!}
                                                                openUpdateModal={openUpdateModal!} element={user}/>
                </Box>)}
        </Card>
    );
};

export default UserCard;