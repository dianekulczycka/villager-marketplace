import {type FC, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import ItemDetailsCard from '../../components/item/ItemDetailsCard.tsx';
import {buy, getById, increaseViews} from '../../../services/fetch/item.service.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import {useQuery} from '@tanstack/react-query';
import type {ItemAdminView} from '../../../models/item/ItemAdminView.ts';
import type {BuyItemDto} from "../../../models/item/BuyItemDto.ts";
import {Snackbar} from "@mui/material";
import Alert from "@mui/material/Alert";
import BuyItemModal from "../../components/modals/BuyItemModal.tsx";

const ItemDetailsPage: FC = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [isBuying, setIsBuying] = useState(false);

    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery<ItemAdminView>({
        queryKey: ['item', id],
        queryFn: () => getById(Number(id)),
        enabled: !!id,
    });

    useEffect(() => {
        if (!data?.id) return;
        increaseViews(data.id);
    }, [data?.id]);

    const onBuyItem = async (dto: BuyItemDto) => {
        setIsBuying(true);
        try {
            await buy(Number(id), dto);
            setOpenModal(false);

            if (dto.amount >= (data?.count ?? 0)) {
                navigate('/items');
            } else {
                setOpenSnackbar(true);
                refetch();
            }
        } finally {
            setIsBuying(false);
        }
    };

    return (
        <>
            <DataStateComponent data={data} error={error} loading={isLoading || isBuying}>
                {data &&
                    (<>
                        <ItemDetailsCard item={data} onBuyItem={onBuyItem} openModal={() => {
                            setOpenModal(true)
                        }}/>
                        <BuyItemModal
                            open={openModal}
                            closeModal={() => {
                                setOpenModal(false)
                            }}
                            onBuyItem={onBuyItem}
                            itemCount={data.count}
                        />
                    </>)
                }
            </DataStateComponent>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity="success"
                    variant="filled"
                    sx={{width: '100%'}}
                >
                    Thanks for purchase!
                </Alert>
            </Snackbar>

        </>

    );
};

export default ItemDetailsPage;