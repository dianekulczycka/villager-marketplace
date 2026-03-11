import { type FC } from 'react';
import type { ProfileStats } from '../../../models/stats/ProfileStats.ts';
import { Box, Typography } from '@mui/material';

interface Props {
  stats: ProfileStats;
}

const StatsComponent: FC<Props> = ({ stats }) => {
  if (stats.role === 'BUYER') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, m: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Total items: {stats.totalItems}
        </Typography>
      </Box>
    );
  }

  if (stats.role === 'SELLER') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, m: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Total items: {stats.totalItems}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Active items: {stats.activeItems}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Total views: {stats.totalViews}
        </Typography>

        {stats.mostViewedItem && (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Most viewed item: {stats.mostViewedItem.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Views: {stats.mostViewedItem.views}
            </Typography>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, m: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Total users: {stats.totalUsers}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Total sellers: {stats.totalSellers}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Flagged users: {stats.totalFlagged}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Banned users: {stats.totalBanned}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Total items: {stats.totalItems}
      </Typography>
    </Box>
  );
};

export default StatsComponent;
