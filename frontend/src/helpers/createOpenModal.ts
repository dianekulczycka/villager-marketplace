import type { ActiveModal } from '../models/item/ActiveModal.ts';

export const createOpenModal =
  <T>(
    setActiveModal: (m: ActiveModal) => void,
    setSelected: (i: T | null) => void,
  ) =>
    (type: ActiveModal, entity?: T) => {
      if (entity) setSelected(entity);
      setActiveModal(type);
    };