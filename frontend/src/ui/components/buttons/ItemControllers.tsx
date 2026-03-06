import type { FC } from 'react';
import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal.tsx';
import type { ActiveModal } from '../../../models/item/ActiveModal.ts';
import type { SubmitHandler } from 'react-hook-form';
import type { UpdateItemDto } from '../../../models/item/UpdateItemDto.ts';
import UpdateItemModal from '../modals/UpdateItemModal.tsx';
import type { ItemView } from '../../../models/item/ItemView.ts';

interface Props {
  onUpdateItem: (id: number, dto: UpdateItemDto) => Promise<void>;
  onDeleteItem: SubmitHandler<number>;
  activeModal: ActiveModal;
  closeModal: () => void;
  openDeleteModal: () => void;
  openUpdateModal: () => void;
  item: ItemView;
}

const ItemControllers: FC<Props> = ({
                                      onUpdateItem,
                                      onDeleteItem,
                                      activeModal,
                                      closeModal,
                                      openUpdateModal,
                                      openDeleteModal,
                                      item,
                                    }) => {
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
        onClick={openUpdateModal}
        sx={{
          bgcolor: 'secondary.main',
          color: '#ffffff',
          '&:hover': { bgcolor: 'secondary.dark' },
        }}>
        <EditIcon />
      </IconButton>

      <UpdateItemModal
        open={activeModal === 'update'}
        closeModal={closeModal}
        onUpdateItem={onUpdateItem}
        item={item}
      />

      <IconButton
        onClick={openDeleteModal}
        sx={{
          bgcolor: 'secondary.main',
          color: '#ffffff',
          '&:hover': { bgcolor: 'secondary.dark' },
        }}>
        <DeleteIcon />
      </IconButton>

      <ConfirmDeleteModal
        open={activeModal === 'delete'}
        closeModal={closeModal}
        onDeleteItem={onDeleteItem}
        itemId={item.id}
      />

    </Box>
  );
};

export default ItemControllers;