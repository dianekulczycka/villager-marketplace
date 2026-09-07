import {useAuth} from "../../store/helpers/useAuth.ts";
import {useNavigate} from "react-router";
import type {LoginReq} from "../../models/auth/LoginReq.ts";
import {login, recover, signIn} from "../../services/fetch/auth.service.ts";
import {routes} from "../../routes/routes.ts";
import type {RecoverReq} from "../../models/auth/RecoverReq.ts";
import type {RegisterReq} from "../../models/auth/RegisterReq.ts";

export const useAuthActions = () => {
    const {loadUser, logoutUser, setUser} = useAuth();
    const navigate = useNavigate();

    const registerUser = async (dto: RegisterReq) => {
        await signIn(dto);
        loadUser();
        navigate(routes.items.root);
    };

    const loginUser = async (dto: LoginReq) => {
        await login(dto);
        loadUser();
        navigate(routes.items.root);
    };

    const logout = async () => {
        try {
            logoutUser();
        } catch (e: unknown) {
            console.log(e);
        } finally {
            setUser(null);
            navigate(routes.auth.login);
        }
    };

    const recoverUser = async (dto: RecoverReq) => {
        await recover(dto);
    };

    return {
        registerUser,
        loginUser,
        logout,
        recoverUser,
    };
};