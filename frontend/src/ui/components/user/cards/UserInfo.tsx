import type {FC} from "react";
import type {UserAdminView} from "../../../../models/user/UserAdminView.ts";
import {Box, Typography} from "@mui/material";

interface Props {
    user: UserAdminView;
    small?: boolean;
    detailed?: boolean;
}

const UserInfo: FC<Props> = ({user, small = false, detailed = true}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                p: small ? 0 : 2,
            }}
        >
            <Typography variant={small ? 'body2' : 'h6'} fontWeight={600}>
                {user.username}
            </Typography>

            {detailed && (
                <>
                    <Typography variant="caption" color="text.secondary">
                        {user.role === 'SELLER' ? user.sellerType : user.role}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default UserInfo;