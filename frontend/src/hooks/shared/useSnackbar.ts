import {useState} from "react";
import type {AlertColor} from "@mui/material";

export const useSnackbar = () => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [status, setStatus] = useState<AlertColor>('success');

    const show = (text: string, status: AlertColor) => {
        setText(text);
        setStatus(status);
        setOpen(true);
    };

    const showSuccess = (text: string) => show(text, 'success');
    const showError = (error: unknown) =>
        show(error instanceof Error ? error.message : String(error), 'error');
    const close = () => setOpen(false);

    return {open, text, status, showSuccess, showError, close};
};