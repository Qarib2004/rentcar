import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOwnerRequestDto {
  @ApiProperty({ description: 'Message explaining why you want to become an owner', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}