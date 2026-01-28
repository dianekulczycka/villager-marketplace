import { Expose, Type } from 'class-transformer';
import { UserPublicDto } from '../../user/dto/user-public.dto';

export class ItemPublicDto {
  @Expose() id: number;
  @Expose() name: string;
  @Expose() price: number;
  @Expose() count: number;
  @Expose() description: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose()
  @Type(() => UserPublicDto)
  seller: UserPublicDto;
}
