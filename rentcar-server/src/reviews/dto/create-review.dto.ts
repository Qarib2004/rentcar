import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Booking ID',
    example: 'uuid',
  })
  @IsString()
  bookingId: string;

  @ApiProperty({
    description: 'Rating from 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Review comment',
    example: 'Great car, very comfortable!',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
