import { type FC } from 'react';
import { Box, Card, Chip, Typography } from '@mui/material';
import type { ItemDetailedView } from '../../../models/item/ItemDetailedView.ts';
import { Link as RouterLink } from 'react-router';

interface Props {
  item: ItemDetailedView;
}

const ItemComponent: FC<Props> = ({ item }) => {
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
          src={`http://localhost:3003/icons/item/${item.iconUrl}`}
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
        <Box
          component={RouterLink}
          to={`/items?sellerId=${item.seller.id}`}
          sx={{
            textDecoration: 'none',
            p: 2,
            color: 'inherit',
            borderRadius: 3,
            overflow: 'hidden',
            transition: '0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          <Box
            component="img"
            src={`http://localhost:3003/icons/user/${item.seller.iconUrl}`}
            alt={item.seller.username}
            sx={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {item.seller.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.seller.sellerType}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Since {item.seller.createdAt.slice(0, 10)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};


export default ItemComponent;