import {type FC} from 'react';
import {Box} from '@mui/material';
import type {UserAdminView} from '../../../models/user/UserAdminView.ts';
import UserDetailsCard from "./cards/UserDetailsCard.tsx";

interface Props {
    users: UserAdminView[];
    openDeleteModal: (user: UserAdminView) => void;
    openUpdateModal: (user: UserAdminView) => void;
    openHardDeleteModal: (user: UserAdminView) => void;
    toggleBan: (user: UserAdminView) => void;
    togglePromote: (user: UserAdminView) => void;
    unflagUser: (user: UserAdminView) => void;
    restoreUser: (user: UserAdminView) => void;
}

const UsersComponent: FC<Props> = ({
                                       users,
                                       openDeleteModal,
                                       openUpdateModal,
                                       toggleBan,
                                       togglePromote,
                                       unflagUser,
                                       restoreUser,
                                       openHardDeleteModal,
                                   }) => {
    return (
        <Box
            sx={{
                width: '66%',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 3,
            }}>
            {
                users.map((user) => (
                    <UserDetailsCard
                        key={user.publicId}
                        user={user}
                        openDeleteModal={openDeleteModal}
                        openHardDeleteModal={openHardDeleteModal}
                        openUpdateModal={openUpdateModal}
                        toggleBan={toggleBan}
                        togglePromote={togglePromote}
                        unflagUser={unflagUser}
                        restoreUser={restoreUser}
                    />
                ))
            }
        </Box>
    );
};

export default UsersComponent;