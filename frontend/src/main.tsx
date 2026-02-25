import { createRoot } from 'react-dom/client';
import './services/interceptors/refresh.interceptor.ts';
import './services/interceptors/error.interceptor.ts';
import './index.css';
import { App } from './App.tsx';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

const loader = document.getElementById('app-loader');
if (loader) loader.remove();
