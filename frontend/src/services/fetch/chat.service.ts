import {api} from "../api.config.ts";
import {endpoints} from "../api.endpoints.ts";
import type {PaginationRes} from "../../models/pagiantion/PaginationRes.ts";
import type {QueryParams} from "../../models/pagiantion/QueryParams.ts";
import type {MessageView} from "../../models/chats/MessageView.ts";
import type {ChatView} from "../../models/chats/ChatView.ts";
import type {ChatSortField} from "../../models/enums/ChatSortField.ts";

export const getAll = async (
    params?: QueryParams<ChatSortField>,
): Promise<PaginationRes<ChatView>> => {
    const {data} = await api.get(endpoints.chats.root, {params});
    return data;
};

export const getById = async (publicUserId: string): Promise<MessageView[]> => {
    const {data} = await api.get(endpoints.chats.byId(publicUserId));
    return data;
};

export const markAsRead = async (uuid: string): Promise<void> => {
    await api.post(endpoints.chats.markAsRead(uuid));
};