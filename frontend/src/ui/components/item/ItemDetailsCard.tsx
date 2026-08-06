import {type FC} from 'react';
import {Box, Button, Card, Chip, Typography} from '@mui/material';
import UserCard from '../user/UserCard.tsx';
import type {ItemAdminView} from '../../../models/item/ItemAdminView.ts';
import {useAuth} from "../../../store/helpers/useAuth.ts";
import Alert from "@mui/material/Alert";
import type {OrderRequestDto} from "../../../models/order/OrderRequestDto.ts";

interface Props {
    item: ItemAdminView;
    order: (dto: OrderRequestDto) => Promise<void>;
    openModal: () => void;
}

const ItemDetailsCard: FC<Props> = ({item, order, openModal}) => {
    const {user: loggedUser} = useAuth();
    const isAuthority = loggedUser?.role === 'ADMIN' || loggedUser?.role === 'MANAGER';

    return (
        <Card
            sx={{
                m: 4,
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: 3,
                overflow: 'hidden',
                height: '80vh',
                display: 'flex',
            }}
        >
            <Box
                sx={{
                    width: '70%',
                    backgroundColor: '#f5f5f5',
                    position: 'relative',
                }}
            >
                <Box
                    component="img"
                    src={item.iconUrl}
                    alt={item.name}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'fill',
                    }}
                />
            </Box>
            <Box
                sx={{
                    width: '30%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 2,
                    backgroundColor: 'background.paper',
                }}
            >
                <Box sx={{mt: 2}}>
                    <Typography variant="h6" fontWeight={600}>
                        {item.name.replaceAll('_', ' ')}
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                        ${item.price} per item
                    </Typography>
                    {item.description && (
                        <Typography variant="h6" sx={{wordBreak: 'break-word'}} fontWeight={400}>
                            {item.description}
                        </Typography>
                    )}
                    <Chip sx={{mt: 1}} size="small" label={`views: ${item.views}`}/>

                    {(loggedUser && loggedUser?.publicId !== item.seller.publicId) && !isAuthority &&
                        <Box sx={{mt: 2}}>
                            <Button
                                variant="contained"
                                color="success"
                                sx={{m: 1}}
                                onClick={() => order({amount: 1})}
                            >
                                Instant buy
                            </Button>
                            <Button variant="contained"
                                    color="warning" sx={{m: 1}} onClick={openModal}>Buy in bulk</Button>
                        </Box>
                    }

                </Box>

                {!!item.isDeleted && <Alert variant="filled" severity="error"> ITEM IS REMOVED </Alert>}

                <UserCard user={item.seller} disabled={!!item.seller.isBanned} variant="S"/>
            </Box>
        </Card>
    );
};


export default ItemDetailsCard;