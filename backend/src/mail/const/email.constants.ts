import { EmailEnum } from '../enums/email.enum';

export type IEmailData = {
  subject: string;
  template: string;
};

type IEmailConstants<T extends Record<string, string>> = {
  [K in keyof T]: IEmailData;
};

export const emailConstants: IEmailConstants<typeof EmailEnum> = {
  [EmailEnum.FLAGGED]: {
    subject: 'Account has been flagged',
    template: 'flagged',
  },
  [EmailEnum.FLAGGED_ADMIN]: {
    subject: 'User has been flagged',
    template: 'flagged-admin',
  },
  [EmailEnum.BANNED]: {
    subject: 'Account has been banned',
    template: 'banned',
  },
  [EmailEnum.BANNED_ADMIN]: {
    subject: 'User has been banned',
    template: 'banned-admin',
  },
  [EmailEnum.RECOVERY_REQUEST]: {
    subject: 'Account recovery request',
    template: 'recovery-request',
  },
  [EmailEnum.RECOVERY_APPROVE]: {
    subject: 'Account restored',
    template: 'recovery-approve',
  },
};
