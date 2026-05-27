import {Alert, type AlertColor, Snackbar} from '@mui/material';
import type {FC} from 'react';

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    text: string;
    status: AlertColor;
}

const InfoSnackbar: FC<Props> = ({
                                     open,
                                     setOpen,
                                     text,
                                     status,
                                 }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={() => setOpen(false)}
        >
            <Alert
                onClose={() => setOpen(false)}
                severity={status}
                variant="filled"
                sx={{width: '100%'}}
            >
                {text}
            </Alert>
        </Snackbar>
    );
};

export default InfoSnackbar;