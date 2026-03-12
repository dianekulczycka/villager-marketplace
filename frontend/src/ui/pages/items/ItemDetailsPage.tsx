import { type FC, useEffect } from 'react';
import { useParams } from 'react-router';
import ItemDetailsCard from '../../components/item/ItemDetailsCard.tsx';
import { getById, increaseViews } from '../../../services/fetch/item.service.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';
import { useQuery } from '@tanstack/react-query';
import type { ItemAdminView } from '../../../models/item/ItemAdminView.ts';

const ItemDetailsPage: FC = () => {
  const { id } = useParams();
  const {
    data,
    isLoading,
    error,
  } = useQuery<ItemAdminView>({
    queryKey: ['user', id],
    queryFn: () => getById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (!data?.id) return;
    increaseViews(data.id);
  }, [data?.id]);

  return (
    <DataStateComponent data={data} error={error} loading={isLoading}>
      {data && <ItemDetailsCard item={data} />}
    </DataStateComponent>
  );
};

export default ItemDetailsPage;