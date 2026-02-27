import { type FC, useState } from 'react';
import LoginForm from '../../components/froms/LoginForm.tsx';
import type { LoginReq } from '../../../models/auth/LoginReq.ts';
import { login } from '../../../services/fetch/auth.service.ts';
import { routes } from '../../../routes/routes.ts';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../store/helpers/useAuth.ts';

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { loadUser } = useAuth();

  const onLogin = async (data: LoginReq) => {
    try {
      await login(data);
      loadUser();
      navigate(routes.items.root);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  return <LoginForm onLogin={onLogin} error={error}/>;
};

export default LoginPage;