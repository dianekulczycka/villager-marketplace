import { type FC, useState } from 'react';
import type { UserSelfView } from '../../../models/user/UserSelfView.ts';
import BecomeSellerModal from '../modals/BecomeSellerModal.tsx';
import UserProfileCard from './UserProfileCard.tsx';
import CreateItemModal from '../modals/CreateItemModal.tsx';
import type { BecomeSellerDto } from '../../../models/user/BecomeSellerDto.ts';
import type { CreateItemDto } from '../../../models/item/CreateItemDto.ts';
import { Box, Card, CardContent } from '@mui/material';
import ActionButton from '../buttons/ActionButton.tsx';

interface Props {
  user: UserSelfView;
  onBecomeSeller: (data: BecomeSellerDto) => void;
  onCreateItem: (data: CreateItemDto) => void;
}

type ActiveModal = 'become' | 'create' | null;

const UserProfileComponent: FC<Props> = ({ user, onBecomeSeller, onCreateItem }) => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const openBecomeModal = () => setActiveModal('become');
  const openCreateModal = () => setActiveModal('create');
  const closeModal = () => setActiveModal(null);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mt: 4,
      }}
    >
      <Card
        sx={{
          width: { xs: '95%', md: '75%' },
          p: 3,
          borderRadius: 3,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 4,
            alignItems: { xs: 'center', sm: 'flex-start' },
          }}
        >
      <UserProfileCard user={user} />
      {user.role === 'BUYER' && (
        <>
          <ActionButton
            action="become seller"
            actionHandler={openBecomeModal}
          />
          <BecomeSellerModal
            open={activeModal === 'become'}
            closeModal={closeModal}
            onBecomeSeller={onBecomeSeller}
          />
        </>
      )}

      {user.role === 'SELLER' && (
        <>
          <ActionButton
            action="New Post"
            actionHandler={openCreateModal}
          />
          <CreateItemModal
            open={activeModal === 'create'}
            closeModal={closeModal}
            onCreateItem={onCreateItem}
          />
        </>
      )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfileComponent;