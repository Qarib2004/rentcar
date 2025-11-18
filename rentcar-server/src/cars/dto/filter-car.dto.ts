import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { TransmissionType, FuelType, CarStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class FilterCarDto {
  @ApiProperty({ required: false, example: 'Toyota' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false, example: 'Camry' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    required: false,
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ enum: TransmissionType, required: false })
  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @ApiProperty({ enum: FuelType, required: false })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @ApiProperty({ enum: CarStatus, required: false })
  @IsOptional()
  @IsEnum(CarStatus)
  status?: CarStatus;

  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  seats?: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ required: false, example: 'Baku' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, example: 2023 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  year?: number;

  @ApiProperty({ required: false, example: 'toyota camry' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    required: false,
    example: 'createdAt',
    enum: ['createdAt', 'pricePerDay', 'year', 'averageRating'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    required: false,
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
