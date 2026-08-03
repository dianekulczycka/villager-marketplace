import type {ItemAdminView} from '../../../../models/item/ItemAdminView.ts';
import type {FC} from 'react';
import SortSearchComponent from '../../shared/SortSearchComponent.tsx';
import DataStateComponent from '../../shared/DataStateComponent.tsx';
import ItemsComponent from '../../item/ItemsComponent.tsx';
import {PaginationComponent} from '../../shared/PaginationComponent.tsx';
import type {PaginationRes} from '../../../../models/pagiantion/PaginationRes.ts';
import type {QueryParams} from "../../../../models/pagiantion/QueryParams.ts";
import {ItemSortField} from "../../../../models/enums/ItemSortField.ts";
import type {ItemQueryParams} from "../../../../models/item/ItemQueryParams.ts";

interface Props {
    query: ItemQueryParams;
    setQuery: (q: Partial<ItemQueryParams>) => void;
    items: PaginationRes<ItemAdminView> | null;
    loading: boolean;
    error: Error | null;
    openUpdateModal: (item: ItemAdminView) => void;
    openDeleteModal: (item: ItemAdminView) => void;
}

const SellerView: FC<Props> = ({
                                   query,
                                   setQuery,
                                   items,
                                   loading,
                                   error,
                                   openUpdateModal,
                                   openDeleteModal,
                               }) => {

    const handlePageChange = (newPage: number) => {
        setQuery({page: newPage});
    };

    return (
        <>
            <SortSearchComponent
                query={query as QueryParams<ItemSortField>}
                setQuery={setQuery}
                fields={Object.values(ItemSortField)}
            />
            <DataStateComponent
                loading={loading}
                error={error}
                data={items}
                isEmpty={items?.data.length === 0}
            >
                {items && (
                    <>
                        <ItemsComponent
                            items={items.data}
                            openUpdateModal={openUpdateModal}
                            openDeleteModal={openDeleteModal}
                        />

                        <PaginationComponent
                            page={query.page!}
                            pageCount={items.pageCount}
                            onChange={handlePageChange}
                        />
                    </>
                )}
            </DataStateComponent>
        </>
    );
};

export default SellerView;