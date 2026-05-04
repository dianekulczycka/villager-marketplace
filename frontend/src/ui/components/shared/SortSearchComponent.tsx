import {useRef, useState} from 'react';
import {Box, debounce, IconButton, MenuItem, Select, TextField} from '@mui/material';
import type {QueryParams} from "../../../models/pagiantion/QueryParams.ts";

interface Props<T extends string> {
    fields: T[];
    query: QueryParams<T>;
    setQuery: (q: Partial<QueryParams<T>>) => void;
}

const SortSearchComponent = <T extends string>({fields, query, setQuery}: Props<T>) => {
    const [inputValue, setInputValue] = useState(query.search ?? '');

    const toggleDirection = () => {
        setQuery({
            sortDirection:
                query.sortDirection === 'asc' ? 'desc' : 'asc',
            page: 1,
        });
    };

    const debouncedSearch = useRef(
        debounce((value: string) => {
            setQuery({search: value, page: 1});
        }, 500)
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
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    debouncedSearch.current(e.target.value);
                }}
            />
            <Select
                size="small"
                value={query.sortBy ?? ''}
                onChange={(e) =>
                    setQuery({
                        sortBy: e.target.value as T,
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
