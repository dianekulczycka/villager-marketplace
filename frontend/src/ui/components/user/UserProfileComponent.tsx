import React, {type FC, type Ref} from 'react';
import UserProfileCard from './cards/UserProfileCard.tsx';
import {Box, Card, CardContent} from '@mui/material';
import ActionButton from '../buttons/ActionButton.tsx';
import type {UserAdminView} from '../../../models/user/UserAdminView.ts';
import type {PageView} from '../../pages/users/UserProfilePage.tsx';
import type {ProfileStats} from '../../../models/stats/ProfileStats.ts';
import StatsComponent from './StatsComponen.tsx';
import DataStateComponent from '../shared/DataStateComponent.tsx';

interface Props {
    user: UserAdminView;
    openBecomeModal: () => void;
    openCreateModal: () => void;
    openDeleteMyProfileModal: (user: UserAdminView) => void;
    openUpdateUserModal: (user: UserAdminView) => void;
    changeView: (pageView: PageView) => void;
    stats: ProfileStats | undefined;
    error: Error | null;
    loading: boolean;
    onUploadAvatar: () => void;
    fileInputRef: Ref<HTMLInputElement>;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const UserProfileComponent: FC<Props> = ({
                                             user,
                                             openBecomeModal,
                                             openCreateModal,
                                             openUpdateUserModal,
                                             openDeleteMyProfileModal,
                                             changeView,
                                             stats,
                                             error,
                                             loading,
                                             onUploadAvatar,
                                             fileInputRef,
                                             onAvatarChange
                                         }) => {

    const isAdmin = user.role === 'ADMIN';
    const isManager = user.role === 'MANAGER';
    const isSeller = user.role === 'SELLER';
    const isBuyer = user.role === 'BUYER';
    const isAuthority = isAdmin || isManager;
    const canEditProfile = !isAdmin && !isManager;
    const canDeleteProfile = !isAdmin;

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
            }}
        >
            <Card
                sx={{
                    width: {xs: '95%', md: '75%'},
                    p: 3,
                    borderRadius: 3,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                }}
            >
                <CardContent
                    sx={{
                        display: 'flex',
                        flexDirection: {xs: 'column', sm: 'row'},
                        gap: 4,
                        alignItems: {xs: 'center', sm: 'flex-start'},
                    }}
                >
                    <UserProfileCard
                        user={user}
                        onUploadAvatar={onUploadAvatar}
                        fileInputRef={fileInputRef}
                        onAvatarChange={onAvatarChange}
                        canLoadAvatar={canEditProfile}
                    />

                    <DataStateComponent
                        loading={loading}
                        error={error}
                        data={stats}
                    >
                        {stats && <StatsComponent stats={stats}/>}
                    </DataStateComponent>

                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1}}>
                        {canEditProfile && (
                            <ActionButton action="Edit profile" actionHandler={() => openUpdateUserModal(user)}/>
                        )}

                        {canDeleteProfile && (
                            <ActionButton action="Delete profile" actionHandler={() => openDeleteMyProfileModal(user)}/>
                        )}

                        {isBuyer && (
                            <ActionButton action="Become seller" actionHandler={openBecomeModal}/>
                        )}

                        {isSeller && (
                            <ActionButton action="New post" actionHandler={openCreateModal}/>
                        )}

                        {isAuthority && (
                            <>
                                <ActionButton action="Show all" actionHandler={() => changeView('USERS')}/>
                                <ActionButton action="Show flagged" actionHandler={() => changeView('FLAGGED_USERS')}/>
                                <ActionButton action="Show banned" actionHandler={() => changeView('BANNED_USERS')}/>
                            </>
                        )}

                        {isAdmin && (
                            <ActionButton action="Show managers" actionHandler={() => changeView('MANAGERS')}/>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default UserProfileComponent;