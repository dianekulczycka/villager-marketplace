import {type FC} from 'react';
import RegisterForm from '../../components/froms/RegisterForm.tsx';
import {useAuthActions} from "../../../hooks/actions/useAuthActions.ts";
import {useLoggedUserRedirect} from "../../../hooks/shared/useLoggedUserRedirect.ts";

const RegisterPage: FC = () => {
    useLoggedUserRedirect();
    const {registerUser} = useAuthActions();
    return <RegisterForm onRegister={registerUser}/>;
};

export default RegisterPage;