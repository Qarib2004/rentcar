import { ApiProperty } from '@nestjs/swagger';
import { CarStatus, FuelType, TransmissionType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCarDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  categoryId: string;
  

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  brand: string;

  @ApiProperty({ example: 'Camry' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ example: 'Black' })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  color: string;

  @ApiProperty({ example: 'ABC-123' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  licensePlate: string;

  @ApiProperty({ example: '1HGBH41JXMN109186', required: false })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiProperty({ enum: TransmissionType, example: TransmissionType.AUTOMATIC })
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @ApiProperty({ enum: FuelType, example: FuelType.PETROL })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(9)
  seats: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(2)
  @Max(5)
  doors: number;

  @ApiProperty({ example: 2.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(10)
  engineCapacity?: number;

  @ApiProperty({ example: 200, required: false })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(2000)
  horsePower?: number;

  @ApiProperty({ example: 15000 })
  @IsInt()
  @Min(0)
  mileage: number;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(1)
  pricePerDay: number;

  @ApiProperty({ example: 5.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pricePerHour?: number;

  @ApiProperty({ example: 200.0 })
  @IsNumber()
  @Min(0)
  deposit: number;

  @ApiProperty({
    example: 'Comfortable sedan with great fuel economy',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'Baku, Azerbaijan' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  location: string;

  @ApiProperty({ example: 40.4093, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: 49.8671, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    example: ['GPS', 'Bluetooth', 'Air Conditioning', 'USB Port'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({ example: 'f5ef7dae-f1ae-409c-88f7-405d8215bd32' })
@IsUUID()
@IsOptional()
ownerId?: string;

@ApiProperty({ type: [String], required: false })
@IsOptional()
@IsArray()
@IsString({ each: true })
images?: string[];

@ApiProperty({ enum: CarStatus, required: false })
@IsOptional()
@IsEnum(CarStatus)
status?: CarStatus;

@ApiProperty({ required: false })
@IsOptional()
@IsBoolean()
isActive?: boolean;

}
