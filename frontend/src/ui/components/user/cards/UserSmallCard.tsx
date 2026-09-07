import type {FC} from "react";
import {Box, Card} from "@mui/material";
import type {UserAdminView} from "../../../../models/user/UserAdminView.ts";
import UserInfo from "./UserInfo.tsx";

interface Props {
    user: UserAdminView;
    disabled?: boolean;
    to?: string;
}

const UserSmallCard: FC<Props> = ({user, disabled = false}) => {
    return (
        <Card
            elevation={0}
            sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                transition: '0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                opacity: disabled ? 0.5 : user.isDeleted ? 0.7 : 1,
                filter: disabled ? 'grayscale(0.5)' : 'none',
            }}
        >
            <Box
                component="img"
                src={user.iconUrl}
                alt={user.username}
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                    flexShrink: 0,
                }}
            />

            <UserInfo
                user={user}
                small
                showActions={!disabled}
            />
        </Card>
    );
};

export default UserSmallCard;