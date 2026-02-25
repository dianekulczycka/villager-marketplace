import { type FC } from 'react';
import { Box, CircularProgress } from '@mui/material';

const PreloaderComponent: FC = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <CircularProgress color="secondary" size="5rem" thickness={4} />
    </Box>
  );
};

export default PreloaderComponent;