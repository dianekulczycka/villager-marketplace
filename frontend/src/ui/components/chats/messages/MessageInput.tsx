import {type SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {messageSchema} from "../../../../validation/message.schema.ts";
import type {FC} from "react";
import {Box, Button, TextField} from "@mui/material";

interface Props {
    onSend: (body: string) => void;
    disabled?: boolean;
}

interface MessageForm {
    body: string;
}

const MessageInput: FC<Props> = ({onSend, disabled = false}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<MessageForm>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            body: '',
        },
    });

    const onSubmit: SubmitHandler<MessageForm> = (data) => {
        onSend(data.body);
        reset();
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 2,
                flexShrink: 0,
            }}
        >
            <TextField
                {...register('body')}
                fullWidth
                multiline
                maxRows={4}
                placeholder="write a message..."
                error={!!errors.body}
                helperText={errors.body?.message}
                disabled={disabled}
            />

            <Button
                type="submit"
                variant="contained"
                disabled={disabled}
            >
                send
            </Button>
        </Box>
    );
};

export default MessageInput;