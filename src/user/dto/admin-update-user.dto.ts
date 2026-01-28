import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { UserRoleEnum } from '../enums/user-role.enum';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;

  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;

  @IsOptional()
  @IsBoolean()
  isFlagged?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
