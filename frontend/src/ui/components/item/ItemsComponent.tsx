import { type FC } from 'react';
import ItemCard from './ItemCard.tsx';
import { Box } from '@mui/material';
import type { ItemView } from '../../../models/item/ItemView.ts';

interface Props {
  items: ItemView[];
}

const ItemsComponent: FC<Props> = ({ items }) => {
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
        items.map((item) => <ItemCard key={item.id} item={item} />)
      }
    </Box>
  );
};

export default ItemsComponent;