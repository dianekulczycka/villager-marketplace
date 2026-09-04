import {useEffect} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {chatWsService} from "../../services/websocket/chat.service.ts";
import type {MessageView} from "../../models/chats/MessageView.ts";

export const useWsChat = (userPublicId?: string) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        chatWsService.connect();
        return () => {
            chatWsService.disconnect();
        };
    }, []);

    useEffect(() => {
        const handleNewMessage = (message: MessageView) => {
            queryClient.setQueryData<MessageView[]>(
                ['messages', userPublicId],
                (oldMessages = []) => [...oldMessages, message],
            );
        };

        chatWsService.onNewMessage(handleNewMessage);

        return () => {
            chatWsService.offNewMessage(handleNewMessage);
        };
    }, [userPublicId, queryClient]);

    const sendMessage = (body: string) => {
        if (!userPublicId) return;
        chatWsService.newMessage({
            recipientPublicId: userPublicId,
            body,
        });
    };

    return {sendMessage};
};