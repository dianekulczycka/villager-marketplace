import {confirm, reject} from "../../services/fetch/order.service.ts";

export const useOrderActions = () => {
    const confirmOrder = (publicId: string) =>
        confirm(publicId);

    const rejectOrder = (publicId: string) =>
        reject(publicId);

    return {
        confirmOrder,
        rejectOrder,
    };
};