import {Box, Card} from '@mui/material';
import type {FC} from "react";
import UserInfo from "../user/cards/UserInfo.tsx";
import type {ChatView} from "../../../models/chats/ChatView.ts";

interface Props {
    chat: ChatView;
    handleChatLoad: (publicId: string) => void;
}

const ChatComponent: FC<Props> = ({chat, handleChatLoad}) => {
    return (
        <Card
            onClick={() => handleChatLoad(chat.publicId)}
            elevation={0}
            sx={{
                borderRadius: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                mx: 1,
                my: 0.75,
                border: '1px solid',
                borderColor: 'divider',
                transition: '0.2s ease',
                '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'text.secondary',
                },
            }}
        >
            <Box
                component="img"
                src={chat.iconUrl}
                alt={chat.username}
                sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                    flexShrink: 0,
                }}
            />

            <Box
                sx={{
                    minWidth: 0,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '& .MuiTypography-root': {
                        fontSize: '1.05rem',
                    },
                }}
            >
                <Box sx={{minWidth: 0, flex: 1}}>
                    <UserInfo
                        user={chat}
                        small
                        detailed={false}
                    />
                </Box>

                {chat.unreadMessages > 0 && (
                    <Box
                        sx={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            backgroundColor: 'secondary.main',
                            color: 'secondary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            flexShrink: 0,
                        }}
                    >
                        {chat.unreadMessages}
                    </Box>
                )}
            </Box>
        </Card>
    );
};

export default ChatComponent;