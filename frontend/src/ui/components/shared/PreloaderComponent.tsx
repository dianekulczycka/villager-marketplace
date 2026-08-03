import {type FC} from 'react';
import {Box, CircularProgress} from '@mui/material';

const PreloaderComponent: FC = () => {
    return (
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(1px)',
                zIndex: 1000,
            }}
        >
            <CircularProgress color="secondary" size="5rem" thickness={4}/>
        </Box>
    );
};

export default PreloaderComponent;