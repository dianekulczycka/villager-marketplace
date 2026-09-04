import {useState} from "react";

export const useFormSubmit = () => {
    const [error, setError] = useState<string | null>(null);

    const submit = async (
        action: () => Promise<unknown>,
        onSuccess?: () => void | Promise<void>,
    ): Promise<void> => {
        setError(null);

        try {
            await action();
            await onSuccess?.();
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            }
        }
    };

    return {
        error,
        submit,
        setError
    };
};