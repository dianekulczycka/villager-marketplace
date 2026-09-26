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
                (oldMessages = []) => {
                    if (oldMessages.some(old => old.uuid === message.uuid)) {
                        return oldMessages;
                    }

                    return [...oldMessages, message];
                },
            );

            queryClient.invalidateQueries({
                queryKey: ['chats'],
            });
        };

        chatWsService.onNewMessage(handleNewMessage);

        return () => {
            chatWsService.offNewMessage(handleNewMessage);
        };
    }, [userPublicId, queryClient]);

    useEffect(() => {
        if (!userPublicId) return;

        chatWsService.openChat(userPublicId);
    }, [userPublicId]);

    useEffect(() => {
        const handleChatOpened = () => {
            queryClient.invalidateQueries({
                queryKey: ['chats'],
            });
        };

        chatWsService.onChatOpened(handleChatOpened);

        return () => {
            chatWsService.offChatOpened(handleChatOpened);
        };
    }, [queryClient]);

    const sendMessage = (body: string) => {
        if (!userPublicId) return;
        chatWsService.newMessage({
            recipientPublicId: userPublicId,
            body,
        });
    };

    return {sendMessage};
};