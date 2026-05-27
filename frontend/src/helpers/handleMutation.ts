import {useState} from "react";
import type {AlertColor} from "@mui/material";

export const useMutationHandler = (
    refetch: () => Promise<unknown>,
) => {
    const [isLoading, setIsLoading] = useState(false);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarText, setSnackbarText] = useState('');
    const [snackbarStatus, setSnackbarStatus] =
        useState<AlertColor>('success');

    const handleMutation = async (
        action: () => Promise<void>,
        successMessage: string,
    ) => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        openSnackbar,
        setOpenSnackbar,
        snackbarText,
        snackbarStatus,
        handleMutation,
    };
};