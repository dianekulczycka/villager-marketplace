import type {FC} from "react";
import type {UserAdminView} from "../../../../models/user/UserAdminView";
import {Box, Card, Typography} from "@mui/material";
import UserInfo from "./UserInfo.tsx";
import UserAdminControllers from "../../buttons/UserAdminControllers.tsx";
import ItemControllers from "../../buttons/ItemControllers.tsx";
import {Link} from 'react-router-dom';
import {routes} from "../../../../routes/routes.ts";

interface Props {
    user: UserAdminView;
    openDeleteModal: (user: UserAdminView) => void;
    openUpdateModal: (user: UserAdminView) => void;
    openHardDeleteModal: (user: UserAdminView) => void;
    toggleBan: (user: UserAdminView) => void;
    togglePromote: (user: UserAdminView) => void;
    unflagUser: (user: UserAdminView) => void;
    restoreUser: (user: UserAdminView) => void;
}

const UserDetailsCard: FC<Props> = ({
                                        user,
                                        openDeleteModal,
                                        openUpdateModal,
                                        openHardDeleteModal,
                                        toggleBan,
                                        togglePromote,
                                        unflagUser,
                                        restoreUser,
                                    }) => {
    return (
        <Card
            component={Link}
            to={routes.items.bySellerId(user.publicId)}
            sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                transition: '0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                textDecoration: 'none',
                color: 'inherit',
                opacity: user.isDeleted ? 0.7 : 1,
            }}
        >
            <Box
                component="img"
                src={user.iconUrl}
                alt={user.username}
                sx={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                    flexShrink: 0,
                }}
            />

            <UserInfo user={user}/>

            {!!user.isBanned && (
                <Box sx={{px: 2}}>
                    <Typography variant="caption" color="text.secondary">
                        Banned at: {new Date(user.bannedAt!).toLocaleDateString()}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block">
                        Banned by: {user.bannedBy}
                    </Typography>
                </Box>
            )}

            {!!user.isDeleted && (
                <Box sx={{px: 2}}>
                    <Typography variant="caption" color="text.secondary">
                        Deleted at: {new Date(user.deletedAt!).toLocaleDateString()}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block">
                        Deleted by: {user.deletedBy}
                    </Typography>
                </Box>
            )}

            <Box sx={{mt: 'auto', pb: 2, pointerEvents: 'auto'}}>
                <UserAdminControllers
                    toggleBan={toggleBan}
                    togglePromote={togglePromote}
                    unflagUser={unflagUser}
                    restoreUser={restoreUser}
                    openHardDeleteModal={openHardDeleteModal}
                    user={user}
                />
            </Box>

            {!user.isDeleted && (
                <Box sx={{pointerEvents: 'auto'}}>
                    <ItemControllers
                        openDeleteModal={openDeleteModal}
                        openUpdateModal={openUpdateModal}
                        element={user}
                    />
                </Box>
            )}
        </Card>
    );
};

export default UserDetailsCard;