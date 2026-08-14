import type {UserPublicView} from "../user/UserPublicView.ts";

export interface MessageView {
    uuid: string;
    body: string;
    isRead: true,
    createdAt: string;
    recipient: Partial<UserPublicView>;
    sender: Partial<UserPublicView>;
}
