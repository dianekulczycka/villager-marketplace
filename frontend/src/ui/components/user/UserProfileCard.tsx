import React, {type FC, type Ref} from 'react';
import {Avatar, Box, Typography} from '@mui/material';
import type {UserSelfView} from '../../../models/user/UserSelfView.ts';
import ActionButton from "../buttons/ActionButton.tsx";

interface Props {
    user: UserSelfView;
    onUploadAvatar: () => void;
    fileInputRef: Ref<HTMLInputElement>;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    canLoadAvatar: boolean
}

const UserProfileCard: FC<Props> = ({user, onUploadAvatar, fileInputRef, onAvatarChange, canLoadAvatar}) => {
    return (
        <>

            <Box>
                <Avatar
                    src={user.iconUrl}
                    alt={user.username}
                    sx={{
                        width: 120,
                        height: 120,
                        border: '3px solid #eee',
                    }}
                />

                {canLoadAvatar &&
                    <>
                        <ActionButton
                            action="Upload avatar"
                            actionHandler={onUploadAvatar}/>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            hidden
                            onChange={onAvatarChange}/>
                    </>}
            </Box>

            <Box sx={{flex: 1, minWidth: 0}}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    {user.username}
                </Typography>

                <Typography variant="body1" gutterBottom>
                    Email: {user.email}
                </Typography>

                <Typography variant="body1" gutterBottom>
                    Role: {user.role === 'SELLER' ? user.sellerType : user.role}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Registered: {new Date(user.createdAt).toLocaleString()}
                </Typography>

                {!!user.isBanned && (
                    <>
                        <Typography variant="caption" color="text.secondary">
                            Banned at: {new Date(user.bannedAt!).toLocaleDateString()}
                        </Typography>
                    </>
                )}
            </Box>
        </>
    );
};

export default UserProfileCard;