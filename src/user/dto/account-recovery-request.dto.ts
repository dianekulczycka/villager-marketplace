import { IsEmail, IsEnum, IsString } from 'class-validator';

export enum AccountRecoveryRequestEnum {
  UNBAN = 'UNBAN',
  UNDELETE = 'UNDELETE',
}

export class AccountRecoveryRequestDto {
  @IsEnum(AccountRecoveryRequestEnum)
  actionType: AccountRecoveryRequestEnum;
  @IsEmail()
  email: string;
  @IsString()
  text: string;
}
