import { type FC, useEffect } from 'react';
import { useParams } from 'react-router';
import ItemDetailsCard from '../../components/item/ItemDetailsCard.tsx';
import { getById, increaseViews } from '../../../services/fetch/item.service.ts';
import { useFetch } from '../../../hooks/useFetch.ts';
import DataStateComponent from '../../components/shared/DataStateComponent.tsx';

const ItemDetailsPage: FC = () => {
  const { id } = useParams();
  const { paginatedData, loading, error } = useFetch(
    () =>
      getById(Number(id),
      ), [id]);

  useEffect(() => {
    if (!paginatedData?.id) return;
    increaseViews(paginatedData.id);
  }, [paginatedData?.id]);

  return (
    <DataStateComponent data={paginatedData} error={error} loading={loading}>
      {paginatedData && <ItemDetailsCard item={paginatedData} />}
    </DataStateComponent>
  );
};

export default ItemDetailsPage;