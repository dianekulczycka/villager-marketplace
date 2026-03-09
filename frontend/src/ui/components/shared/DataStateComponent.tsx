import type { FC, ReactNode } from 'react';
import PreloaderComponent from './PreloaderComponent.tsx';
import ErrorComponent from '../error/ErrorComponent.tsx';
import Alert from '@mui/material/Alert';
import { Box } from '@mui/material';

interface Props {
  loading: boolean;
  error: string | null;
  isEmpty?: boolean;
  data: unknown;
  children: ReactNode;
}

const DataStateComponent: FC<Props> = ({ loading, error, data, isEmpty, children }) => {
  const msgWrap = (node: ReactNode) => (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mt: 2,
      }}
    >
      {node}
    </Box>
  );

  if (loading) return msgWrap(<PreloaderComponent />);
  if (error) return msgWrap(<ErrorComponent error={error} />);
  if (!loading && !data) return msgWrap(<ErrorComponent error="no data fetched" />);
  if (isEmpty) return msgWrap(<Alert severity="info">no data yet!</Alert>);

  return <>{children}</>;
};

export default DataStateComponent;