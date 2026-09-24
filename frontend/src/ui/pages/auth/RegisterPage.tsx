import {type FC} from 'react';
import RegisterForm from '../../components/froms/RegisterForm.tsx';
import {useAuthActions} from "../../../hooks/actions/useAuthActions.ts";
import {useLoggedUserRedirect} from "../../../hooks/shared/useLoggedUserRedirect.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import {useMutation} from "../../../hooks/shared/useMutation.ts";
import type {RegisterReq} from "../../../models/auth/RegisterReq.ts";

const RegisterPage: FC = () => {
    const {fetch, isMutating, ...snackbar} = useMutation();
    useLoggedUserRedirect();
    const {registerUser} = useAuthActions();

    const handleRegister = (
        data: RegisterReq,
    ): Promise<void> => {
        return fetch(
            () => {
                return registerUser(data);
            }
        );
    };

    return (
        <>
            <RegisterForm handleRegister={handleRegister} isMutating={isMutating}/>;
            <InfoSnackbar
                open={snackbar.open}
                setOpen={snackbar.close}
                text={snackbar.text}
                status={snackbar.status}
            />
        </>
    )
};

export default RegisterPage;