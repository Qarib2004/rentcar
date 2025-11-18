import { ApiProperty } from '@nestjs/swagger';

export class CreateCarSwaggerDto {
  @ApiProperty({ type: 'string', format: 'binary', isArray: true })
  images: Express.Multer.File[];

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  brand: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  year: number;

  @ApiProperty()
  color: string;

  @ApiProperty()
  licensePlate: string;

  @ApiProperty({ enum: ['MANUAL', 'AUTOMATIC'] })
  transmission: string;

  @ApiProperty({ enum: ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'] })
  fuelType: string;

  @ApiProperty()
  seats: number;

  @ApiProperty()
  doors: number;

  @ApiProperty()
  mileage: number;

  @ApiProperty()
  pricePerDay: number;

  @ApiProperty()
  deposit: number;

  @ApiProperty()
  location: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  features: string[];
}
