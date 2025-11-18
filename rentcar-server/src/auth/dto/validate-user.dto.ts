import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class ValidateUserDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  avatar?: string | null;

  @IsOptional()
  phone?: string | null;
}
