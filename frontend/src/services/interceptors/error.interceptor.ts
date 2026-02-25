import { api } from '../api.config.ts';
import axios from 'axios';
import type { ApiError } from '../../models/error/ApiError.ts';

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!axios.isAxiosError(err)) {
      console.warn(err);
      return Promise.reject(
        err instanceof Error ? err : new Error("unexpected error")
      );
    }

    const apiError = err.response?.data as ApiError | undefined;

    const msg =
      apiError?.errors ||
      err.message ||
      "unexpected error";

    const statusCode = apiError?.statusCode ?? err.response?.status;
    const path = apiError?.path;
    const timestamp = apiError?.timestamp;

    if (statusCode) {
      console.warn(
        `${statusCode} ${msg}${path ? `: ${path}` : ""}${
          timestamp ? ` at ${timestamp}` : ""
        }`
      );
    } else {
      console.warn(msg);
    }

    const error = new Error(msg) as Error & { api?: ApiError };
    error.api = apiError;

    return Promise.reject(error);
  }
);