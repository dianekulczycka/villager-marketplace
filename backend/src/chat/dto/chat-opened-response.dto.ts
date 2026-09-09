import { ApiProperty } from '@nestjs/swagger';

export class ChatOpenedResponseDto {
  @ApiProperty({ example: '0f05aca3' })
  otherUserPublicId: string;

  @ApiProperty({ example: 3 })
  unreadMessages: number;
}
