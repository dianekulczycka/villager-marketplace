import { type FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { CreateItemDto } from '../../../models/item/CreateItemDto.ts';

interface Props {
  open: boolean;
  closeModal: () => void;
  onCreateItem: SubmitHandler<CreateItemDto>;
}

const CreateItemModal: FC<Props> = ({ open, closeModal, onCreateItem }) => {

  console.log(open);
  console.log(closeModal);
  console.log(onCreateItem);

  return (
    <div>

    </div>
  );
};

export default CreateItemModal;