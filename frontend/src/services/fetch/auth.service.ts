import type { RegisterReq } from '../../models/auth/RegisterReq.ts';
import type { UserPublicView } from '../../models/user/UserPublicView.ts';
import type { AxiosResponse } from 'axios';
import { api } from '../api.config.ts';
import { endpoints } from '../api.endpoints.ts';
import type { LoginReq } from '../../models/auth/LoginReq.ts';
import type { AccountRecoveryReq } from '../../models/auth/AccountRecoveryReq.ts';

export const signIn = async (data: RegisterReq): Promise<UserPublicView> => {
  const response: AxiosResponse<UserPublicView> = await api.post(endpoints.auth.register, data);
  return response.data;
};

export const login = async (data: LoginReq): Promise<void> => {
  await api.post(endpoints.auth.login, data);
};

export const logout = async (): Promise<void> => {
  await api.post(endpoints.auth.logout);
};

export const recover = async (data: AccountRecoveryReq): Promise<void> => {
  await api.post(endpoints.auth.recovery, data);
};