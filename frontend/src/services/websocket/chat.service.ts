import {io, Socket} from 'socket.io-client';
import type {MessageView} from "../../models/chats/MessageView.ts";
import type {CreateMessage} from "../../models/chats/CreateMessage.ts";
import type {ChatOpenedResp} from "../../models/chats/ChatOpenedResp.ts";

const WS_URL = import.meta.env.VITE_WS_URL;

class ChatWsService {
    private socket: Socket | null = null;

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(WS_URL, {
            withCredentials: true,
        });
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }

    newMessage(createMessageDto: CreateMessage) {
        if (!this.socket) throw new Error('ws not connected');
        this.socket.emit('newMessage', createMessageDto);
    }

    onNewMessage(
        callback: (message: MessageView) => void,
    ): void {
        this.socket?.on('newMessage', callback);
    }

    offNewMessage(
        callback: (message: MessageView) => void,
    ): void {
        this.socket?.off('newMessage', callback);
    }

    openChat(otherUserPublicId: string) {
        if (!this.socket) throw new Error('ws not connected');

        this.socket.emit('openChat', {
            userPublicId: otherUserPublicId,
        });
    }

    onChatOpened(
        callback: (data: ChatOpenedResp) => void,
    ): void {
        this.socket?.on('chatOpened', callback);
    }

    offChatOpened(
        callback: (data: ChatOpenedResp) => void,
    ): void {
        this.socket?.off('chatOpened', callback);
    }
}

export const chatWsService = new ChatWsService();