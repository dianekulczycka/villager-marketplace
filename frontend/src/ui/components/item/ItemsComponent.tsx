import { type FC } from 'react';
import ItemCard from './ItemCard.tsx';
import { Box } from '@mui/material';
import type { ItemView } from '../../../models/item/ItemView.ts';
import type { ActiveModal } from '../../../models/item/ActiveModal.ts';
import type { SubmitHandler } from 'react-hook-form';
import type { UpdateItemDto } from '../../../models/item/UpdateItemDto.ts';

interface Props {
  items: ItemView[];
  onUpdateItem: (id: number, dto: UpdateItemDto) => Promise<void>;
  onDeleteItem: SubmitHandler<number>;
  activeModal: ActiveModal;
  closeModal: () => void;
  openDeleteModal: () => void;
  openUpdateModal: () => void;
}

const ItemsComponent: FC<Props> = ({
                                     items,
                                     onUpdateItem,
                                     onDeleteItem,
                                     activeModal,
                                     closeModal,
                                     openDeleteModal,
                                     openUpdateModal,
                                   }) => {
  return (
    <Box
      sx={{
        width: '66%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 3,
      }}>
      {
        items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onUpdateItem={onUpdateItem}
            onDeleteItem={onDeleteItem}
            activeModal={activeModal}
            closeModal={closeModal}
            openDeleteModal={openDeleteModal}
            openUpdateModal={openUpdateModal}
          />))
      }
    </Box>
  );
};

export default ItemsComponent;