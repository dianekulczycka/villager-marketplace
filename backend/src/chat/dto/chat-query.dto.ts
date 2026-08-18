import { SortQueryDto } from '../../shared/pagination/sort-query.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum ChatSortFieldEnum {
  USERNAME = 'username',
}

export const CHAT_SORT_MAP: Record<ChatSortFieldEnum, string> = {
  [ChatSortFieldEnum.USERNAME]: 'username',
};

export class ChatQueryDto extends SortQueryDto<ChatSortFieldEnum> {
  @IsOptional()
  @IsEnum(ChatSortFieldEnum)
  declare sortBy?: ChatSortFieldEnum;
}
