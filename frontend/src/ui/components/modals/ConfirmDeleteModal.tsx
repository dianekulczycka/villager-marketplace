import React, { type FC, useState } from 'react';
import { Backdrop, Box, Button, Modal, Typography } from '@mui/material';
import ErrorComponent from '../error/ErrorComponent.tsx';

interface Props {
  open: boolean;
  closeModal: () => void;
  onDelete: () => Promise<void>;
}

const ConfirmDeleteModal: FC<Props> = ({ open, closeModal, onDelete }) => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onDelete();
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