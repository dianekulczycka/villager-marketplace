import { createRoot } from 'react-dom/client';
import './services/interceptors/refresh.interceptor.ts';
import './services/interceptors/error.interceptor.ts';
import './index.css';
import { App } from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const root = createRoot(document.getElementById('root')!);

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

const loader = document.getElementById('app-loader');
if (loader) loader.remove();