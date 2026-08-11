import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ required: true, example: 'hello world' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  body: string;

  @ApiProperty({ required: true, example: '0f05aca3' })
  @IsString()
  recipientPublicId: string;
}
