export interface AccountRecoveryReq {
  actionType: 'UNBAN' | 'UNDELETE';
  email: string;
  text: string;
}