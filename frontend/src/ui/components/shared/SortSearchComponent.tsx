import { type FC, useMemo } from 'react';
import { Box, debounce, IconButton, MenuItem, Select, TextField } from '@mui/material';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

interface Props {
  fields: string[];
}

const SortSearchComponent: FC<Props> = ({ fields }) => {
  const [query, setQuery] = useQueryParams({
    page: NumberParam,
    sortBy: StringParam,
    sortDirection: StringParam,
    search: StringParam,
  });

  const toggleDirection = () => {
    setQuery({
      sortDirection:
        query.sortDirection === 'asc' ? 'desc' : 'asc',
      page: 1,
    });
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setQuery({ search: value, page: 1 });
      }, 100),
    [setQuery],
  );

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 2,
      gap: 2,
      m: 2,
      p: 1,
      backgroundColor: '#ffffff',
      width: '20%',
    }}>
      <TextField
        size="small"
        label="search"
        value={query.search ?? ''}
        onChange={(e) => debouncedSearch(e.target.value)}
      />

      <Select
        size="small"
        value={query.sortBy ?? ''}
        onChange={(e) =>
          setQuery({
            sortBy: e.target.value,
            page: 1,
          })
        }
      >
        {fields.map((field) => (
          <MenuItem key={field} value={field}>
            {field}
          </MenuItem>
        ))}
      </Select>

      <IconButton onClick={toggleDirection}>
        {query.sortDirection === 'desc' ? '↓' : '↑'}
      </IconButton>
    </Box>
  );
};

export default SortSearchComponent;
