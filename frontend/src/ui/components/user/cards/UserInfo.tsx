import type {FC} from "react";
import type {UserAdminView} from "../../../../models/user/UserAdminView.ts";
import {Box, IconButton, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import {routes} from "../../../../routes/routes.ts";
import SendIcon from "@mui/icons-material/Send";
import StorefrontIcon from '@mui/icons-material/Storefront';
import {useAuth} from "../../../../store/helpers/useAuth.ts";

interface Props {
    user: UserAdminView;
    small?: boolean;
    detailed?: boolean;
    showActions: boolean;
}

const UserInfo: FC<Props> = ({
                                 user,
                                 small = false,
                                 detailed = true,
                                 showActions = false,
                             }) => {
    const {user: loggedUser, isAuthority} = useAuth();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                p: small ? 0 : 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <Typography variant={small ? 'body2' : 'h6'} fontWeight={600}>
                    {user.username}
                </Typography>

                {showActions && (
                    <Box sx={{display: 'flex', gap: 0.5}}>
                        {user.role === 'SELLER' && (
                            <IconButton
                                component={Link}
                                to={routes.items.bySellerId(user.publicId)}
                                size="small"
                                color="secondary"
                            >
                                <StorefrontIcon fontSize="small"/>
                            </IconButton>
                        )}

                        {!isAuthority && !(loggedUser?.publicId === user.publicId) && (
                            <IconButton
                                component={Link}
                                to={routes.chats.buildById(user.publicId)}
                                size="small"
                                color="secondary"
                            >
                                <SendIcon fontSize="small"/>
                            </IconButton>
                        )}
                    </Box>
                )}
            </Box>

            {detailed && (
                <>
                    <Typography variant="caption" color="text.secondary">
                        {user.role === 'SELLER' ? user.sellerType : user.role}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default UserInfo;