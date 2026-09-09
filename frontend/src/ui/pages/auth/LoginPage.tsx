import {type FC, useState} from 'react';
import LoginForm from '../../components/froms/LoginForm.tsx';
import type {ActiveModal} from '../../../models/item/ActiveModal.ts';
import type {RecoverReq} from '../../../models/auth/RecoverReq.ts';
import RecoverModal from '../../components/modals/RecoverModal.tsx';
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import {useAuthActions} from "../../../hooks/actions/useAuthActions.ts";
import {useLoggedUserRedirect} from "../../../hooks/shared/useLoggedUserRedirect.ts";

const LoginPage: FC = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    useLoggedUserRedirect();

    const {
        loginUser,
        recoverUser,
    } = useAuthActions();

    const openModal = () => setActiveModal('restore');
    const closeModal = () => setActiveModal(null);

    const onRecover = async (dto: RecoverReq) => {
        await recoverUser(dto);
        setOpenSnackbar(true);
    };

    return (
        <>
            <LoginForm login={loginUser} openModal={openModal}/>
            <RecoverModal
                open={activeModal === 'restore'}
                closeModal={closeModal}
                recover={onRecover}
            />
            <InfoSnackbar
                open={openSnackbar}
                setOpen={setOpenSnackbar}
                text="Request successful, please wait to be restored"
                status="success"
            />
        </>
    );
};

export default LoginPage;