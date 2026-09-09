import type {UserPublicView} from "../user/UserPublicView.ts";

export interface MessageView {
    uuid: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    recipient: Pick<UserPublicView, 'publicId' | 'username'>;
    sender: Pick<UserPublicView, 'publicId' | 'username'>;
}
