import {type FC} from 'react';
import ChatComponent from "./ChatComponent.tsx";
import {Box} from "@mui/material";
import type {ChatView} from "../../../models/chats/ChatView.ts";

interface Props {
    chats: ChatView[];
    handleChatLoad: (publicId: string) => void;
}

const ChatsList: FC<Props> = ({chats, handleChatLoad}) => {
    return (
        <Box
            component="ul"
            sx={{
                listStyle: 'none',
                p: 0,
                m: 0,
            }}
        >
            {chats.map((chat) => (
                <Box
                    component="li"
                    key={chat.publicId}
                >
                    <ChatComponent
                        chat={chat}
                        handleChatLoad={handleChatLoad}
                    />
                </Box>
            ))}
        </Box>
    );
};

export default ChatsList;