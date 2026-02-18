import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortDirectionEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  perPage = 10;

  @IsOptional()
  @IsEnum(SortDirectionEnum)
  sortDirection?: SortDirectionEnum = SortDirectionEnum.ASC;

  @IsOptional()
  @IsString()
  search?: string;
}
