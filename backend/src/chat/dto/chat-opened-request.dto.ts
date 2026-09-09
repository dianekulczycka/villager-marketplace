import { ApiProperty } from '@nestjs/swagger';

export class OpenChatDto {
  @ApiProperty({ example: '0f05aca3' })
  userPublicId: string;
}
