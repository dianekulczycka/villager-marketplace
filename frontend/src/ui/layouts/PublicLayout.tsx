import type { FC } from 'react';
import { Outlet } from 'react-router';
import { Box } from '@mui/material';
import BackgroundLayout from './BgLayout.tsx';

const PublicLayout: FC = () => {
  return (
    <BackgroundLayout>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Outlet />
      </Box>
    </BackgroundLayout>
  );
};

export default PublicLayout;