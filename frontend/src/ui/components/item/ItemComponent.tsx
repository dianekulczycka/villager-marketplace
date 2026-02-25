import { type FC } from 'react';
import { Box, Card, CardContent, CardMedia, Chip, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { ItemView } from '../../../models/item/ItemView.ts';

interface Props {
  item: ItemView;
}

const ItemComponent: FC<Props> = ({ item }) => {
  return (
    <Card
      component={RouterLink}
      to={`/items/id/${item.id}`}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
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
        image={`http://localhost:3003/icons/item/${item.iconUrl}`}
        alt={item.name}
        sx={{
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
        }}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
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
    </Card>
  );
};


export default ItemComponent;