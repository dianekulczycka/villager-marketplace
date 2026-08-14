import type {FC} from "react";
import {Box} from "@mui/material";
import type {UserAdminView} from "../../../models/user/UserAdminView.ts";
import UserInfo from "../user/cards/UserInfo.tsx";

interface Props {
    user: UserAdminView;
}

const ChatHeader: FC<Props> = ({user}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                flexShrink: 0,
            }}
        >
            <Box
                component="img"
                src={user.iconUrl}
                alt={user.username}
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                }}
            />

            <UserInfo
                user={user}
                small
                detailed={false}
            />
        </Box>
    );
};

export default ChatHeader;