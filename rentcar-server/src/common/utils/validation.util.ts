import { BadRequestException } from '@nestjs/common';

export class ValidationUtil {
  static validateLicense(licenseNumber?: string | null, licenseExpiry?: Date | null): void {
    if (!licenseNumber) {
      throw new BadRequestException('Driver license number is required for booking');
    }

    if (!licenseExpiry) {
      throw new BadRequestException('Driver license expiry date is required for booking');
    }

    const now = new Date();
    const expiryDate = new Date(licenseExpiry);

    if (expiryDate < now) {
      throw new BadRequestException('Driver license has expired. Please update your license information');
    }

    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 30) {
      throw new BadRequestException('Driver license expires in less than 30 days. Please update your license information');
    }
  }

  static validateAge(birthDate?: Date | null, minimumAge: number = 18): void {
    if (!birthDate) {
      throw new BadRequestException('Date of birth is required');
    }

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < minimumAge) {
      throw new BadRequestException(`You must be at least ${minimumAge} years old to book a car`);
    }
  }

  static validatePhoneNumber(phone?: string | null): boolean {
    if (!phone) {
      return false;
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static formatPhoneNumber(phone: string): string {
    return phone.replace(/\s/g, '').replace(/^(\d{1,3})(\d{3})(\d{3})(\d{4})$/, '+$1 $2 $3 $4');
  }
}

