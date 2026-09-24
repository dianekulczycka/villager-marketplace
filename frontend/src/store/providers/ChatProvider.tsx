import {type FC, useEffect, useState} from 'react';
import {Outlet} from 'react-router-dom';
import {ChatContext} from '../context/chat.context.ts';
import {getUnreadMessages} from "../../services/fetch/user.service.ts";

export const ChatProvider: FC = () => {
    const [totalUnread, setTotalUnread] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadTotalUnread = async () => {
        try {
            const totalUnread = await getUnreadMessages();
            setTotalUnread(totalUnread);
        } catch {
            setTotalUnread(null);
        } finally {
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        loadTotalUnread();
    }, []);

    return (
        <ChatContext.Provider
            value={{
                totalUnread,
                setTotalUnread,
                loadTotalUnread,
                isLoaded,
            }}
        >
            <Outlet />
        </ChatContext.Provider>
    );
};