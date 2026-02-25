import axios from 'axios';
import { endpoints } from './api.endpoints.ts';

export const api = axios.create({
  baseURL: endpoints.baseURL,
  withCredentials: true,
});
