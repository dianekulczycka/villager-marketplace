import { type FC, useState } from 'react';
import type { UserSelfView } from '../../../models/user/UserSelfView.ts';
import { type SubmitHandler, useForm } from 'react-hook-form';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import type { BecomeSellerDto } from '../../../models/user/BecomeSellerDto.ts';
import ErrorComponent from '../error/ErrorComponent.tsx';
import { becomeSeller } from '../../../services/fetch/user.service.ts';
import type { PaginationRes } from '../../../models/pagiantion/PaginationRes.ts';
import type { ItemView } from '../../../models/item/ItemView.ts';
import ItemsComponent from '../item/ItemsComponent.tsx';

interface Props {
  user: UserSelfView;
  loadUser: () => void;
  items: PaginationRes<ItemView>;
}

const UserProfileComponent: FC<Props> = ({ user, loadUser, items }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<BecomeSellerDto>({});

  const openModal = () => setOpen(true);
  const closeModal = () => {
    setOpen(false);
    reset();
  };

  const onSubmitSeller: SubmitHandler<BecomeSellerDto> = async (data) => {
    try {
      await becomeSeller({ sellerType: data.sellerType });
      loadUser();
      closeModal();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };


  return (
    <>
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

            <Avatar
              src={`http://localhost:3003/icons/user/${user.iconUrl}`}
              alt={user.username}
              sx={{
                width: 120,
                height: 120,
                border: '3px solid #eee',
              }}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {user.username}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                id: {user.id}
              </Typography>

              <Typography variant="body1" gutterBottom>
                Email: {user.email}
              </Typography>

              <Typography variant="body1" gutterBottom>
                Role: {user.role}
              </Typography>

              {user.sellerType && (
                <Typography variant="body1" gutterBottom>
                  Seller Type: {user.sellerType}
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Since: {new Date(user.createdAt).toLocaleString()}
              </Typography>

              {!!user.isBanned && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Chip
                    label={`Banned at: ${
                      user.bannedAt
                        ? new Date(user.bannedAt).toLocaleString()
                        : 'unknown'
                    }`}
                    color="error"
                  />
                </>
              )}
              {
                user.role == 'BUYER' && (
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={openModal}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 2,
                        px: 3,
                      }}
                    >
                      Become Seller
                    </Button>
                  </Box>
                )
              }
              {
                user.role == 'SELLER' && (
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={openModal}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 2,
                        px: 3,
                      }}
                    >
                      New Post
                    </Button>
                  </Box>
                )
              }
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Modal open={open} onClose={closeModal}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitSeller)}
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
            become seller
          </Typography>

          <TextField
            select
            label="seller type"
            {...register('sellerType')}
            fullWidth
          >
            <MenuItem value="ARMORER">Armorer</MenuItem>
            <MenuItem value="BUTCHER">Butcher</MenuItem>
            <MenuItem value="CARTOGRAPHER">Cartographer</MenuItem>
            <MenuItem value="CLERIC">Cleric</MenuItem>
            <MenuItem value="FARMER">Farmer</MenuItem>
            <MenuItem value="FISHERMAN">Fisherman</MenuItem>
            <MenuItem value="FLETCHER">Fletcher</MenuItem>
            <MenuItem value="LEATHERWORKER">Leatherworker</MenuItem>
            <MenuItem value="LIBRARIAN">Librarian</MenuItem>
            <MenuItem value="MASON">Mason</MenuItem>
            <MenuItem value="SHEPHERD">Shepherd</MenuItem>
            <MenuItem value="TOOLSMITH">Toolsmith</MenuItem>
            <MenuItem value="WEAPONSMITH">Weaponsmith</MenuItem>
          </TextField>

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
      <ItemsComponent items={items.data} />
    </>
  );
};

export default UserProfileComponent;