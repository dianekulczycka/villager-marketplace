import type { FC } from 'react';
import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Props {
  editHandler: () => void;
  deleteHandler: () => void;
}

const ItemControllers: FC<Props> = ({ editHandler, deleteHandler }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        display: 'flex',
        gap: 1,
        top: 0,
        right: 0,
        p: 1,
      }}>
      <IconButton
        onClick={editHandler}
        sx={{
          bgcolor: 'secondary.main',
          color: '#ffffff',
          '&:hover': { bgcolor: 'secondary.dark' }
        }}>
        <EditIcon />
      </IconButton>
      <IconButton
        onClick={deleteHandler}
        sx={{
          bgcolor: 'secondary.main',
          color: '#ffffff',
          '&:hover': { bgcolor: 'secondary.dark' }
        }}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default ItemControllers;