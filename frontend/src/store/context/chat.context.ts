import {createContext} from "react";

export interface ChatContext {
    totalUnread: number | null;
    setTotalUnread: (totalUnread: number | null) => void;
    loadTotalUnread: () => Promise<void>;
    isLoaded: boolean;
}

export const ChatContext = createContext<ChatContext>({
    totalUnread: null,
    setTotalUnread: () => {
    },
    loadTotalUnread: async () => {
    },
    isLoaded: false,
});