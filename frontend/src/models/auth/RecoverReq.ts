export interface RecoverReq {
  actionType: 'UNBAN' | 'UNDELETE';
  email: string;
  text: string;
}
