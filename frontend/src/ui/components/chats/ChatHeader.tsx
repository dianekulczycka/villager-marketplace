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
                gap: 2.5,
                p: 2,
                mx: 1,
                my: 1,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                flexShrink: 0,
            }}
        >
            <Box
                component="img"
                src={user.iconUrl}
                alt={user.username}
                sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                    flexShrink: 0,
                }}
            />

            <Box
                sx={{
                    minWidth: 0,
                    '& .MuiTypography-root': {
                        fontSize: '1.2rem',
                    },
                }}
            >
                <UserInfo
                    user={user}
                    small
                    detailed={false}
                />
            </Box>
        </Box>
    );
};

export default ChatHeader;