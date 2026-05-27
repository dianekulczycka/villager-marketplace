import {type FC, useEffect, useState} from 'react';
import {useParams} from 'react-router';
import ItemDetailsCard from '../../components/item/ItemDetailsCard.tsx';
import {getById, increaseViews} from '../../../services/fetch/item.service.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import {useQuery} from '@tanstack/react-query';
import type {ItemAdminView} from '../../../models/item/ItemAdminView.ts';
import OrderModal from "../../components/modals/OrderModal.tsx";
import type {OrderRequestDto} from "../../../models/order/OrderRequestDto.ts";
import {order as orderItem} from "../../../services/fetch/order.service.ts";
import {useMutationHandler} from "../../../helpers/handleMutation.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";

const ItemDetailsPage: FC = () => {
    const {id} = useParams();
    const [openModal, setOpenModal] = useState<boolean>(false);

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

    const {
        isLoading: isOrdering,
        openSnackbar,
        setOpenSnackbar,
        snackbarText,
        snackbarStatus,
        handleMutation,
    } = useMutationHandler(refetch);

    useEffect(() => {
        if (!data?.id) return;
        increaseViews(data.id);
    }, [data?.id]);

    const order = async (dto: OrderRequestDto): Promise<void> => {
        await handleMutation(
            async () => {
                await orderItem(Number(id), dto);
                setOpenModal(false);
            }, 'Order created!');
    };

    return (
        <>
            <DataStateComponent data={data} error={error} loading={isLoading || isOrdering}>
                {data &&
                    (<>
                        <ItemDetailsCard item={data} order={order} openModal={() => {
                            setOpenModal(true)
                        }}/>
                        <OrderModal
                            open={openModal}
                            closeModal={() => {
                                setOpenModal(false)
                            }}
                            order={order}
                            itemCount={data.count}
                        />
                    </>)
                }
            </DataStateComponent>
            <InfoSnackbar
                open={openSnackbar}
                setOpen={setOpenSnackbar}
                text={snackbarText}
                status={snackbarStatus}
            />
        </>

    );
};

export default ItemDetailsPage;