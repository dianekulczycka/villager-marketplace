import type {UserAdminView} from "../user/UserAdminView.ts";

export type ChatView = UserAdminView & {
    unreadMessages: number;
};