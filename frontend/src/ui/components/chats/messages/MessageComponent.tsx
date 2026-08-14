import {type FC} from 'react';
import {Box, Typography} from '@mui/material';
import type {MessageView} from "../../../../models/chats/MessageView.ts";

interface Props {
    message: MessageView;
    currentUserPublicId: string;
}

const MessageComponent: FC<Props> = ({
                                         message,
                                         currentUserPublicId,
                                     }) => {
    const isOwnMessage =
        message.sender.publicId === currentUserPublicId;

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
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
                    backgroundColor: isOwnMessage
                        ? 'primary.main'
                        : 'action.hover',
                    color: isOwnMessage
                        ? 'primary.contrastText'
                        : 'text.primary',
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

                {isOwnMessage && (
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