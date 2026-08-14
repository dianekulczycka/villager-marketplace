import {type FC} from 'react';
import type {UserAdminView} from "../../../models/user/UserAdminView.ts";
import ChatComponent from "./ChatComponent.tsx";

interface Props {
    chats: UserAdminView[];
    handleChatLoad: (publicId: string) => void;
}

const ChatsList: FC<Props> = ({chats, handleChatLoad}) => {
    return (
        <ul>
            {chats.map((chat) => <li key={chat.publicId}>
                <ChatComponent
                    user={chat}
                    handleChatLoad={handleChatLoad}
                />
            </li>)}
        </ul>
    );
};

export default ChatsList;