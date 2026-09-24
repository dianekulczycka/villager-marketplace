import {type FC} from 'react';
import {Box} from "@mui/material";

interface Props {
    unreadMessages: number;
}

const UnreadMessagesChip: FC<Props> = ({unreadMessages}) => {
    return (
        <Box
            sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: 'secondary.main',
                color: 'secondary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 600,
                flexShrink: 0,
            }}
        >
            {unreadMessages}
        </Box>
    );
};

export default UnreadMessagesChip;