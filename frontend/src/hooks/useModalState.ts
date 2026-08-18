import {useState} from "react";
import type {ActiveModal} from "../models/item/ActiveModal.ts";

export function useModalState<T>() {
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [selected, setSelected] = useState<T | null>(null);

    const openModal = (modal: ActiveModal, entity?: T) => {
        setActiveModal(modal);
        if (entity) setSelected(entity);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const createOpenFn = (modal: ActiveModal) => (entity: T) => {
        openModal(modal, entity);
    };

    return {
        activeModal,
        selected,
        openModal,
        closeModal,
        createOpenFn,
    };
}