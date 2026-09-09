import type {UserPublicView} from "../user/UserPublicView.ts";

export type ChatView = Pick<
    UserPublicView,
    'publicId' | 'username' | 'iconUrl'
> & {
    unreadMessages: number;
};