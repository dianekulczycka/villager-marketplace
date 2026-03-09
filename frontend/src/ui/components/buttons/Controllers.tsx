import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Props<T> {
  element: T;
  openDeleteModal: (element: T) => void;
  openUpdateModal: (element: T) => void;
}

const Controllers = <T, >({ openUpdateModal, openDeleteModal, element }: Props<T>) => {
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
        onClick={() => openUpdateModal(element)}
        sx={{
          bgcolor: 'secondary.main',
          color: '#ffffff',
          '&:hover': { bgcolor: 'secondary.dark' },
        }}>
        <EditIcon />
      </IconButton>
      <IconButton
        onClick={() => openDeleteModal(element)}
        sx={{
          bgcolor: 'secondary.main',
          color: '#ffffff',
          '&:hover': { bgcolor: 'secondary.dark' },
        }}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default Controllers;