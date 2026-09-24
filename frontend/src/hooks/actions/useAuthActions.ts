import {useAuth} from "../../store/helpers/useAuth.ts";
import {useNavigate} from "react-router";
import type {LoginReq} from "../../models/auth/LoginReq.ts";
import {login, requestRecovery, signIn} from "../../services/fetch/auth.service.ts";
import {routes} from "../../routes/routes.ts";
import type {RecoverReq} from "../../models/auth/RecoverReq.ts";
import type {RegisterReq} from "../../models/auth/RegisterReq.ts";
import {useChat} from "../../store/helpers/useChat.ts";
import type {RecoverResp} from "../../models/auth/RecoverResp.ts";

export const useAuthActions = () => {
    const {loadUser, logoutUser, setUser} = useAuth();
    const {setTotalUnread, loadTotalUnread} = useChat();
    const navigate = useNavigate();

    const registerUser = async (dto: RegisterReq) => {
        await signIn(dto);
        await loadUser();
        navigate(routes.items.root);
    };

    const loginUser = async (dto: LoginReq) => {
        await login(dto);
        await loadUser();
        await loadTotalUnread();
        navigate(routes.items.root);
    };

    const logout = async () => {
        try {
            logoutUser();
        } catch (e: unknown) {
            console.log(e);
        } finally {
            setUser(null);
            setTotalUnread(null);
            navigate(routes.auth.login);
        }
    };

    const handleRequestRecovery = async (dto: RecoverReq): Promise<RecoverResp> => {
        return requestRecovery(dto);
    };

    return {
        registerUser,
        loginUser,
        logout,
        handleRequestRecovery,
    };
};