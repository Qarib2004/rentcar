import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'User ID',
    example: 'uuid',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Booking Confirmed',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your booking has been confirmed',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Notification type',
    example: 'booking',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Additional data',
    required: false,
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

