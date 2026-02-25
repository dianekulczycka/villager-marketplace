import type { FC } from 'react';
import { Outlet } from 'react-router';
import HeaderComponent from '../components/shared/HeaderComponent.tsx';
import BackgroundLayout from './BgLayout.tsx';
import { Box } from '@mui/material';

const BasicLayout: FC = () => {
  return (
    <BackgroundLayout>
      <HeaderComponent />
      <Box sx={{
        flex: 1, display: 'flex',
        flexDirection: 'column',
      }}>
        <Outlet />
      </Box>
    </BackgroundLayout>
  );
};

export default BasicLayout;