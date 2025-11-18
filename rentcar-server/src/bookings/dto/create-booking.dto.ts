import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: '732yedhq2-dh87-0d0k-qssj9' })
  @IsUUID()
  carId: string;

  @ApiProperty({ example: '2025-10-25T10:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-10-30T10:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Pick up at airport', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({ example: 'Baku Airport', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  pickupLocation?: string;

  @ApiProperty({ example: 'Baku City Center', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  returnLocation?: string;
}
