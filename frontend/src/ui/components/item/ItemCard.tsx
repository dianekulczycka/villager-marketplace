import {type FC} from 'react';
import {Box, Card, CardContent, CardMedia, Chip, Typography} from '@mui/material';
import {Link as RouterLink} from 'react-router-dom';
import {useAuth} from '../../../store/helpers/useAuth.ts';
import ItemControllers from '../buttons/ItemControllers.tsx';
import type {ItemAdminView} from '../../../models/item/ItemAdminView.ts';

interface Props {
    item: ItemAdminView;
    openDeleteModal: (item: ItemAdminView) => void;
    openUpdateModal: (item: ItemAdminView) => void;
}

const ItemCard: FC<Props> = ({
                                 item,
                                 openDeleteModal,
                                 openUpdateModal,
                             }) => {
    const {user} = useAuth();
    const canModify: boolean = (item.seller.publicId === user?.publicId) || (user?.role === 'ADMIN' || user?.role === 'MANAGER');

    return (
        <Card
            sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                transition: '0.2s',
                height: '100%',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                },
                ...(!!item.isDeleted && {
                    opacity: 0.7,
                }),
            }}
        >
            <CardMedia
                component="img"
                height="300"
                image={item.iconUrl}
                alt={item.name}
                sx={{
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                }}
            />
            <CardContent component={RouterLink}
                         to={`/items/id/${item.publicId}`}
                         sx={{
                             display: 'flex',
                             textDecoration: 'none',
                             flexDirection: 'column',
                             gap: 1,
                         }}>
                <Typography variant="h6" color="#000000" fontWeight={600}>
                    {item.name.replaceAll('_', ' ')}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                    ${item.price} per item
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 1,
                    }}
                >
                    <Chip size="small" label={`in stock: ${item.count}`}/>
                    <Chip size="small" label={`views: ${item.views}`}/>
                </Box>
            </CardContent>
            {canModify && !item.isDeleted && <ItemControllers
                openDeleteModal={openDeleteModal}
                openUpdateModal={openUpdateModal}
                element={item}/>}
        </Card>
    );
};


export default ItemCard;