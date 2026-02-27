import type { FC } from 'react';
import { Box, Button } from '@mui/material';

interface Props {
  action: string;
  actionHandler: () => void;
}

const ActionButton: FC<Props> = ({ action, actionHandler }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Button
        variant="contained"
        color="secondary"
        onClick={actionHandler}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 2,
          px: 3,
        }}
      >
        {action}
      </Button>
    </Box>
  );
};

export default ActionButton;