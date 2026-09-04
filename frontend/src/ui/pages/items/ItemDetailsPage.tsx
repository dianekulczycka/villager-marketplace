import {type FC, useEffect, useState} from 'react';
import {useParams} from 'react-router';
import ItemDetailsCard from '../../components/item/ItemDetailsCard.tsx';
import {getById, increaseViews} from '../../../services/fetch/item.service.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import {useQuery} from '@tanstack/react-query';
import type {ItemAdminView} from '../../../models/item/ItemAdminView.ts';
import OrderModal from "../../components/modals/OrderModal.tsx";
import type {OrderRequestDto} from "../../../models/order/OrderRequestDto.ts";
import InfoSnackbar from "../../components/shared/InfoSnackbar.tsx";
import {useMutation} from "../../../hooks/shared/useMutation.ts";
import {useItemActions} from "../../../hooks/actions/useItemActions.ts";

const ItemDetailsPage: FC = () => {
    const {publicId} = useParams();
    const {orderItem} = useItemActions();
    const [openModal, setOpenModal] = useState(false);

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery<ItemAdminView>({
        queryKey: ['item', publicId],
        queryFn: () => getById(publicId!),
        enabled: !!publicId,
    });

    const {fetch, isMutating, ...snackbar} = useMutation(refetch);

    useEffect(() => {
        if (!data?.publicId) return;
        increaseViews(data.publicId);
    }, [data?.publicId]);

    const order = (dto: OrderRequestDto): Promise<void> =>
        fetch(
            () => orderItem(publicId!, dto),
            'Order created!',
            () => setOpenModal(false),
        );

    return (
        <>
            <DataStateComponent
                data={data}
                error={error}
                loading={isLoading || isMutating}
            >
                {data && (
                    <>
                        <ItemDetailsCard
                            item={data}
                            order={order}
                            openModal={() => setOpenModal(true)}
                        />

                        <OrderModal
                            open={openModal}
                            closeModal={() => setOpenModal(false)}
                            order={order}
                            itemCount={data.count}
                        />
                    </>
                )}
            </DataStateComponent>

            <InfoSnackbar
                open={snackbar.open}
                setOpen={snackbar.close}
                text={snackbar.text}
                status={snackbar.status}
            />
        </>
    );
};

export default ItemDetailsPage;