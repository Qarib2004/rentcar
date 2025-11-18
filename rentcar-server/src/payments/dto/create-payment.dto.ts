import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ example: 'card', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({
    example: 'http://localhost:5173/booking/success',
    required: false,
  })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiProperty({
    example: 'http://localhost:5173/booking/cancel',
    required: false,
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
