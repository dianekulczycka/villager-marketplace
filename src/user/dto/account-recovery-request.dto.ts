import { IsEmail, IsEnum } from 'class-validator';

export enum AccountRecoveryRequestEnum {
  UNBAN = 'UNBAN',
  UNDELETE = 'UNDELETE',
}

export class AccountRecoveryRequestDto {
  @IsEnum(AccountRecoveryRequestEnum)
  actionType: AccountRecoveryRequestEnum;
  @IsEmail()
  email: string;
}
