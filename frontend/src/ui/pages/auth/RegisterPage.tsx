import { type FC } from 'react';
import RegisterForm from '../../components/froms/RegisterForm.tsx';
import type { RegisterReq } from '../../../models/auth/RegisterReq.ts';
import { signIn } from '../../../services/fetch/auth.service.ts';
import { routes } from '../../../routes/routes.ts';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../store/helpers/useAuth.ts';

const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  const onRegister = async (data: RegisterReq) => {
    await signIn(data);
    loadUser();
    navigate(routes.items.root);
  };
  return <RegisterForm onRegister={onRegister} />;
};
export default RegisterPage;