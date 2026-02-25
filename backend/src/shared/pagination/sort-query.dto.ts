import { PaginationRequestDto } from './pagination-request.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class SortQueryDto<T> extends PaginationRequestDto {
  @IsOptional()
  @IsEnum(Object)
  sortBy?: T;
}
