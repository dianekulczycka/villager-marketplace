import { type FC } from 'react';
import ItemCard from './ItemCard.tsx';
import { Box } from '@mui/material';
import type { ItemAdminView } from '../../../models/item/ItemAdminView.ts';

interface Props {
  items: ItemAdminView[];
  openDeleteModal: (item: ItemAdminView) => void;
  openUpdateModal: (item: ItemAdminView) => void;
}

const ItemsComponent: FC<Props> = ({ items, openDeleteModal, openUpdateModal }) => {
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
            openDeleteModal={openDeleteModal}
            openUpdateModal={openUpdateModal}
            item={item}
          />))
      }
    </Box>
  );
};

export default ItemsComponent;