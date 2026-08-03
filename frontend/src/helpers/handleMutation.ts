import {useState} from "react";
import type {AlertColor} from "@mui/material";

export const useMutationHandler = (
    refetch: () => Promise<unknown>,
) => {
    const [isMutating, setIsMutating] = useState(false);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarText, setSnackbarText] = useState('');
    const [snackbarStatus, setSnackbarStatus] =
        useState<AlertColor>('success');

    const handleMutation = async (
        action: () => Promise<void>,
        successMessage: string,
    ) => {
        setIsMutating(true);
        try {
            await action();
            setSnackbarText(successMessage);
            setSnackbarStatus('success');
            setOpenSnackbar(true);
            await refetch();
        } catch (e) {
            if (e instanceof Error) {
                setSnackbarText(e.message);
                setSnackbarStatus('error');
                setOpenSnackbar(true);
            }
        } finally {
            setIsMutating(false);
        }
    };

    return {
        isMutating,
        openSnackbar,
        setOpenSnackbar,
        snackbarText,
        snackbarStatus,
        handleMutation,
    };
};