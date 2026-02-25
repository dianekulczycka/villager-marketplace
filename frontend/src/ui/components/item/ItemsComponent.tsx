import { type FC } from 'react';
import ItemComponent from './ItemComponent.tsx';
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
        mt: 4,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 3,
      }}>
      {
        items.map((item) => <ItemComponent key={item.id} item={item} />)
      }
    </Box>
  );
};

export default ItemsComponent;