import { type FC } from 'react';
import Alert from '@mui/material/Alert';
import { Box } from '@mui/material';

interface Props {
  error: string;
}

const ErrorComponent: FC<Props> = ({ error }) => {
  if (!error) return null;

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mt: 2,
      }}
    >
      <Alert severity="error">{error}</Alert>
    </Box>
  );
};

export default ErrorComponent;