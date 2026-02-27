import { api } from '../api.config.ts';
import { endpoints } from '../api.endpoints.ts';

let refreshPromise: Promise<unknown> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = error.config?.url;

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (url?.includes(endpoints.auth.login)) {
      return Promise.reject(error);
    }

    if (url?.includes(endpoints.auth.refresh)) {
      window.location.href = endpoints.auth.login;
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api.post(endpoints.auth.refresh);
      }
      await refreshPromise;
      refreshPromise = null;
      return api(originalRequest);
    } catch (e) {
      refreshPromise = null;
      window.location.href = endpoints.auth.login;
      return Promise.reject(e);
    }
  },
);