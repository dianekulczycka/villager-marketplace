import {type FC} from 'react';
import {Box} from '@mui/material';
import MessageComponent from "./MessageComponent.tsx";
import type {MessageView} from "../../../../models/chats/MessageView.ts";

interface Props {
    messages: MessageView[];
    currentUserPublicId: string;
}

const MessagesComponent: FC<Props> = ({messages, currentUserPublicId}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                p: 1,
            }}
        >
            {messages.map((message) => (
                <MessageComponent
                    key={message.uuid}
                    message={message}
                    currentUserPublicId={currentUserPublicId}
                />
            ))}
        </Box>
    );
};

export default MessagesComponent;