import {useState} from "react";
import {useSnackbar} from "./useSnackbar.ts";

export const useMutation = (refetch?: () => Promise<unknown>) => {
    const [isMutating, setIsMutating] = useState(false);
    const snackbar = useSnackbar();

    const fetch = async <T>(
        action: () => Promise<T>,
        successMessage?: string,
        onSuccess?: (data: T) => void | Promise<void>,
    ): Promise<void> => {
        setIsMutating(true);

        try {
            const data = await action();
            if (successMessage) snackbar.showSuccess(successMessage);
            await onSuccess?.(data);
            if (refetch) await refetch();
        } catch (error) {
            snackbar.showError(error);
        } finally {
            setIsMutating(false);
        }
    };

    return {...snackbar, isMutating, fetch};
};