import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Chat room ID',
    example: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  chatRoomId: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, when can I pick up the car?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

