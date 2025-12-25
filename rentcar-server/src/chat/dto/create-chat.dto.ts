import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatRoomDto {
  @ApiProperty({ description: 'ID of the recipient user' })
  @IsNotEmpty()
  @IsString()
  recipientId: string;
}