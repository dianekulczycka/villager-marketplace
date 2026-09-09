import { IsEmail, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AccountRecoveryRequestEnum {
  UNBAN = 'UNBAN',
  UNDELETE = 'UNDELETE',
}

export class AccountRecoveryRequestDto {
  @ApiProperty({ example: 'UNBAN', enum: AccountRecoveryRequestEnum })
  @IsEnum(AccountRecoveryRequestEnum)
  actionType: AccountRecoveryRequestEnum;
  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: 'hello! pls unban me' })
  @IsString()
  text: string;
}
