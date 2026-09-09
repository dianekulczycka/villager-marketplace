import {useAuth} from "../../store/helpers/useAuth.ts";
import {useNavigate} from "react-router";
import {useEffect} from "react";
import {routes} from "../../routes/routes.ts";

export const useLoggedUserRedirect = () => {
    const {user, isLoaded} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && user) navigate(routes.users.me, {replace: true});
    }, [isLoaded, user, navigate]);
};