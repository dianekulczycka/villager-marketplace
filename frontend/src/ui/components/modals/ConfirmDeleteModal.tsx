import { type FC, useState } from 'react';
import { Backdrop, Box, Button, Modal, Typography } from '@mui/material';
import type { SubmitHandler } from 'react-hook-form';
import ErrorComponent from '../error/ErrorComponent.tsx';

interface Props {
  open: boolean;
  closeModal: () => void;
  onDeleteItem: SubmitHandler<number>;
  itemId: number;
}

const ConfirmDeleteModal: FC<Props> = ({ open, closeModal, onDeleteItem, itemId }) => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      await onDeleteItem(itemId);
      closeModal();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  return (
    <Modal slots={{ backdrop: Backdrop }}
           slotProps={{
             backdrop: {
               sx: {
                 bgcolor: 'rgba(0,0,0,0.1)',
               },
             },
           }}
           open={open}
           onClose={closeModal}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 360,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          delete?
        </Typography>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          sx={{ textTransform: 'none', fontWeight: 500 }}
        >
          send
        </Button>
        <Button onClick={closeModal} sx={{ textTransform: 'none' }}>
          cancel
        </Button>
        {error && <ErrorComponent error={error} />}
      </Box>
    </Modal>
  );
};

export default ConfirmDeleteModal;