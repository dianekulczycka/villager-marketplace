import { type FC, useEffect } from 'react';
import { useParams } from 'react-router';
import ItemDetailsComponent from '../../components/item/ItemDetailsComponent.tsx';
import { getById, increaseViews } from '../../../services/fetch/item.service.ts';
import ErrorComponent from '../../components/error/ErrorComponent.tsx';
import { useFetch } from '../../../hooks/useFetch.ts';
import PreloaderComponent from '../../components/shared/PreloaderComponent.tsx';

const ItemDetailsPage: FC = () => {
  const { id } = useParams();

  const { data, loading, error } = useFetch(
    () =>
      getById(Number(id),
      ), [id]);

  useEffect(() => {
    if (!data?.id) return;
    increaseViews(data.id);
  }, [data?.id]);

  if (loading) return <PreloaderComponent />;
  if (error) return <ErrorComponent error={error} />;
  if (!data) return <ErrorComponent error="no data" />;

  return <ItemDetailsComponent item={data} />;
};

export default ItemDetailsPage;