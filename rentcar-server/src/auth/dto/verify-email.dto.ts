import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Verification token',
    example: 'verification-token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

