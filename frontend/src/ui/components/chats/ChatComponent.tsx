import {Box, Card} from '@mui/material';
import type {UserAdminView} from "../../../models/user/UserAdminView.ts";
import type {FC} from "react";
import UserInfo from "../user/cards/UserInfo.tsx";

interface Props {
    user: UserAdminView;
    handleChatLoad: (publicId: string) => void;
}

const ChatComponent: FC<Props> = ({user, handleChatLoad}) => {
    return (
        <Card
            onClick={() => handleChatLoad(user.publicId)}
            elevation={0}
            sx={{
                borderRadius: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                transition: '0.2s ease',
                '&:hover': {
                    backgroundColor: 'action.hover',
                },
            }}
        >
            <Box
                component="img"
                src={user.iconUrl}
                alt={user.username}
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                    flexShrink: 0,
                }}
            />

            <UserInfo
                user={user}
                small
                detailed={false}
            />
        </Card>
    );
};

export default ChatComponent;