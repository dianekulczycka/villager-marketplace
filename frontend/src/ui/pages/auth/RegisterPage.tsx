import {type FC} from 'react';
import RegisterForm from '../../components/froms/RegisterForm.tsx';
import {useAuthActions} from "../../../hooks/actions/useAuthActions.ts";

const RegisterPage: FC = () => {
    const {registerUser} = useAuthActions();
    return <RegisterForm onRegister={registerUser}/>;
};

export default RegisterPage;