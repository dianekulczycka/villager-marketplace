import { type FC } from 'react';
import { Box, Card, CardContent, CardMedia, Chip, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { ItemView } from '../../../models/item/ItemView.ts';
import { routes } from '../../../routes/routes.ts';
import { useAuth } from '../../../store/helpers/useAuth.ts';
import ItemControllers from '../buttons/ItemControllers.tsx';

interface Props {
  item: ItemView;
}

const ItemCard: FC<Props> = ({ item }) => {
  const { user } = useAuth();
  const isOwner: boolean = item.sellerId === user?.id;

  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        transition: '0.2s',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={routes.icons.item(item.iconUrl)}
        alt={item.name}
        sx={{
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
        }}
      />
      <CardContent component={RouterLink}
                   to={`/items/id/${item.id}`}
                   sx={{
                     display: 'flex',
                     textDecoration: 'none',
                     flexDirection: 'column',
                     gap: 1,
                   }}>
        <Typography variant="h6" color="#000000" fontWeight={600}>
          {item.name.replaceAll('_', ' ')}
        </Typography>
        <Typography variant="h6" color="primary" fontWeight={700}>
          ${item.price} per item
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 1,
          }}
        >
          <Chip size="small" label={`count: ${item.count}`} />
          <Chip size="small" label={`views: ${item.views}`} />
        </Box>
      </CardContent>
      {isOwner && <ItemControllers editHandler={() => {
      }} deleteHandler={() => {
      }} />}
    </Card>
  );
};


export default ItemCard;