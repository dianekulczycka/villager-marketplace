import { type FC, useState } from 'react';
import LoginForm from '../../components/froms/LoginForm.tsx';
import type { LoginReq } from '../../../models/auth/LoginReq.ts';
import { login, recover } from '../../../services/fetch/auth.service.ts';
import { routes } from '../../../routes/routes.ts';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../store/helpers/useAuth.ts';
import type { ActiveModal } from '../../../models/item/ActiveModal.ts';
import type { RecoverReq } from '../../../models/auth/RecoverReq.ts';
import { Snackbar } from '@mui/material';
import RecoverModal from '../../components/modals/RecoverModal.tsx';

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const openModal = () => setActiveModal('restore');
  const closeModal = () => setActiveModal(null);

  const onLogin = async (dto: LoginReq) => {
      await login(dto);
      loadUser();
      navigate(routes.items.root);
  };

  const onRecover = async (dto: RecoverReq) => {
      await recover(dto);
      setOpen(true);
  };

  return (
    <>
      <LoginForm onLogin={onLogin} openModal={openModal}/>
      <RecoverModal open={activeModal === 'restore'} closeModal={closeModal} onRecover={onRecover} />
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
        message="Request successful. Please wait to be restored"
      />
    </>);
};

export default LoginPage;