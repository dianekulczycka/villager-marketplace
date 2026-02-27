import { type FC } from 'react';
import { Box, Card, Chip, Typography } from '@mui/material';
import type { ItemDetailedView } from '../../../models/item/ItemDetailedView.ts';
import UserCard from '../user/UserCard.tsx';
import { routes } from '../../../routes/routes.ts';

interface Props {
  item: ItemDetailedView;
}

const ItemDetailsCard: FC<Props> = ({ item }) => {
  return (
    <Card
      sx={{
        m: 4,
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 3,
        overflow: 'hidden',
        height: '80vh',
        display: 'flex',
      }}
    >
      <Box
        sx={{
          width: '70%',
          backgroundColor: '#f5f5f5',
          position: 'relative',
        }}
      >
        <Box
          component="img"
          src={routes.icons.item(item.iconUrl)}
          alt={item.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'fill',
          }}
        />
      </Box>
      <Box
        sx={{
          width: '30%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {item.name.replaceAll('_', ' ')}
          </Typography>
          <Typography variant="h6" color="primary" fontWeight={700}>
            ${item.price} per item
          </Typography>
          {item.description && (
            <Typography variant="h6" sx={{ wordBreak: 'break-word' }} fontWeight={400}>
              {item.description}
            </Typography>
          )}
          <Chip sx={{ mt: 1 }} size="small" label={`views: ${item.views}`} />
        </Box>

        <UserCard user={item.seller} variant="S" />

      </Box>
    </Card>
  );
};


export default ItemDetailsCard;