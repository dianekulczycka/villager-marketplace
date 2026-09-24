import {type FC, useState} from 'react';
import LoginForm from '../../components/froms/LoginForm.tsx';
import type {ActiveModal} from '../../../models/item/ActiveModal.ts';
import type {RecoverReq} from '../../../models/auth/RecoverReq.ts';
import RequestRecoveryModal from '../../components/modals/RequestRecoveryModal.tsx';
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import {useAuthActions} from "../../../hooks/actions/useAuthActions.ts";
import {useLoggedUserRedirect} from "../../../hooks/shared/useLoggedUserRedirect.ts";
import {useMutation} from "../../../hooks/shared/useMutation.ts";
import type {LoginReq} from "../../../models/auth/LoginReq.ts";

const LoginPage: FC = () => {
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const {fetch, isMutating, ...snackbar} = useMutation();
    useLoggedUserRedirect();

    const {
        loginUser,
        handleRequestRecovery: requestRecovery,
    } = useAuthActions();

    const openModal = () => setActiveModal('restore');
    const closeModal = () => setActiveModal(null);

    const handleLogin = (data: LoginReq): Promise<void> => {
        return fetch(() => loginUser(data));
    };

    const handleRequestRecovery = (
        data: RecoverReq,
    ): Promise<void> => {
        return fetch(
            () => requestRecovery(data),
            response => response.message,
            closeModal,
        );
    };

    return (
        <>
            <LoginForm
                handleLogin={handleLogin}
                openModal={openModal}
                isMutating={isMutating}
            />

            <RequestRecoveryModal
                open={activeModal === 'restore'}
                closeModal={closeModal}
                handleRequestRecovery={handleRequestRecovery}
                isMutating={isMutating}
            />

            <InfoSnackbar
                open={snackbar.open}
                setOpen={snackbar.close}
                text={snackbar.text}
                status={snackbar.status}
            />
        </>
    );
};

export default LoginPage;