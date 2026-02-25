import { type FC } from 'react';
import ErrorComponent from '../../components/error/ErrorComponent.tsx';
import { Box } from '@mui/material';

const ErrorPage404: FC = () => {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ErrorComponent error={'no page with given route'} />
    </Box>);
};

export default ErrorPage404;