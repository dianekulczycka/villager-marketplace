import type {FC} from 'react';
import {Box, Link, Paper, Stack, Typography,} from '@mui/material';
import {Link as RouterLink} from 'react-router-dom';
import type {ProfileStats} from "../../../models/stats/ProfileStats.ts";

interface Props {
    stats: ProfileStats;
}

const StatsComponent: FC<Props> = ({stats}) => {
    if (stats.role === 'BUYER') {
        return (
            <Box sx={{m: 2, minWidth: 260}}>
                <Typography variant="h6" sx={{mb: 0.75}}>
                    Stats
                </Typography>

                <Stack spacing={0.4}>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                            Total items
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {stats.totalItems}
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        );
    }

    if (stats.role === 'SELLER') {
        return (
            <Box sx={{m: 2, minWidth: 260}}>
                <Typography variant="h6" sx={{mb: 0.75}}>
                    Stats
                </Typography>

                <Stack spacing={0.4}>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                            Total items
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {stats.totalItems}
                        </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                            Active items
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {stats.activeItems}
                        </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                            Total views
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {stats.totalViews}
                        </Typography>
                    </Box>
                </Stack>

                {stats.mostViewedItem && (
                    <Paper
                        variant="outlined"
                        sx={{
                            mt: 1,
                            p: 1,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            Most viewed item
                        </Typography>

                        <Link
                            component={RouterLink}
                            to={`/items/id/${stats.mostViewedItem.publicId}`}
                            underline="hover"
                            sx={{
                                display: 'block',
                                mt: 0.25,
                                fontWeight: 500,
                            }}
                        >
                            {stats.mostViewedItem.name}
                        </Link>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                        >
                            {stats.mostViewedItem.views} views
                        </Typography>
                    </Paper>
                )}
            </Box>
        );
    }

    return (
        <Box sx={{m: 2, minWidth: 260}}>
            <Typography variant="h6" sx={{mb: 0.75}}>
                Stats
            </Typography>

            <Stack spacing={0.4}>
                <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        Total users
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                        {stats.totalUsers}
                    </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        Total sellers
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                        {stats.totalSellers}
                    </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        Flagged users
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                        {stats.totalFlagged}
                    </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        Banned users
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                        {stats.totalBanned}
                    </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        Total items
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                        {stats.totalItems}
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );
};

export default StatsComponent;