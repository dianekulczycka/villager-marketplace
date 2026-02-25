import { Pagination, Stack } from '@mui/material';
import type { FC } from 'react';

interface Props {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export const PaginationComponent: FC<Props> = ({ page, pageCount, onChange }) => {
  if (pageCount <= 1) return null;
  return (
    <Stack alignItems="center" mt={2}>
      <Pagination
        page={page}
        count={pageCount}
        color="primary"
        shape="rounded"
        size="large"
        onChange={(_, value) => onChange(value)}
      />
    </Stack>
  );
};
