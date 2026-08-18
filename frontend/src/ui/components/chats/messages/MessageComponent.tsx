import {type FC} from 'react';
import {Box, Typography} from '@mui/material';
import type {MessageView} from "../../../../models/chats/MessageView.ts";
import {useAuth} from "../../../../store/helpers/useAuth.ts";

interface Props {
    message: MessageView;
}

const MessageComponent: FC<Props> = ({message}) => {
    const {user: loggedUser} = useAuth();
    if (!loggedUser) return null;

    const isMyMessage =
        message.sender.publicId === loggedUser.publicId;

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                px: 2,
                py: 0.5,
            }}
        >
            <Box
                sx={{
                    maxWidth: '70%',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    color: isMyMessage
                        ? 'secondary.contrastText'
                        : 'success.contrastText',
                    backgroundColor: isMyMessage
                        ? 'secondary.main'
                        : 'success.main',
                }}
            >
                <Typography
                    sx={{
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                    }}
                >
                    {message.body}
                </Typography>

                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 0.5,
                        textAlign: 'right',
                        opacity: 0.7,
                    }}
                >
                    {new Date(message.createdAt).toLocaleString([], {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Typography>

                {isMyMessage && (
                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            textAlign: 'right',
                            opacity: 0.7,
                        }}
                    >
                        {message.isRead ? 'Read' : 'Sent'}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default MessageComponent;