import { type FC, useState } from 'react';
import RegisterForm from '../../components/froms/RegisterForm.tsx';
import type { RegisterReq } from '../../../models/auth/RegisterReq.ts';
import { signIn } from '../../../services/fetch/auth.service.ts';
import { routes } from '../../../routes/routes.ts';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../store/helpers/useAuth.ts';

const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const onRegister = async (data: RegisterReq) => {
    try {
      await signIn(data);
      loadUser();
      navigate(routes.items.root);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  return <RegisterForm onRegister={onRegister} error={error} />;
};
export default RegisterPage;