import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/databases/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import {
  AuthResponse,
  JwtPayload,
  TokenResponse,
} from './interfaces/jwt-payload.interface';
import argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { ValidateUserDto } from './dto/validate-user.dto';
import { UserRole } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User exists');
    }

    const hashedPassword = await argon2.hash(registerDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: registerDto.role || 'CLIENT',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

   
  const sessionKey = `user:session:${user.id}`;
  const sessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    accessToken: tokens.accessToken,
    loginAt: new Date().toISOString(),
  };

  console.log('🔴 Saving to Redis:', sessionKey);
  console.log('🔴 Session data:', sessionData);

  try {
    await this.cacheManager.set(sessionKey, sessionData, 86400);
    console.log('✅ Successfully saved to Redis');
    
    const checkData = await this.cacheManager.get(sessionKey);
    console.log('🔍 Data read back from Redis:', checkData);
    
    if (!checkData) {
      console.error('❌ Data was not saved to Redis!');
    }
  } catch (error) {
    console.error('❌ Redis save error:', error);
  }

  const refreshKey = `user:refresh:${user.id}`;
  await this.cacheManager.set(refreshKey, tokens.refreshToken, 7 * 24 * 60 * 60);
  console.log('🔴 Refresh key saved:', refreshKey);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
        },
      );

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateUser(userId: string): Promise<ValidateUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        phone: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<number>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<number>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        verifyEmailDto.token,
        {
          secret: this.configService.get<string>('jwt.secret'),
        },
      );

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isVerified) {
        throw new BadRequestException('Email already verified');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    const verificationToken = await this.generateVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return { message: 'Verification email sent' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return { message: 'If email exists, password reset link has been sent' };
    }

    const resetToken = await this.generatePasswordResetToken(user.id);
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If email exists, password reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        resetPasswordDto.token,
        {
          secret: this.configService.get<string>('jwt.secret'),
        },
      );

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await argon2.hash(resetPasswordDto.newPassword);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  private async generateVerificationToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, type: 'verification' },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '24h',
      },
    );
  }

  private async generatePasswordResetToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, type: 'password-reset' },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '1h',
      },
    );
  }







async getSession(userId: string) {
  const sessionKey = `user:session:${userId}`;
  return await this.cacheManager.get(sessionKey);
}

async validateSession(userId: string, token: string): Promise<boolean> {
  const session: any = await this.getSession(userId);
  
  if (!session) {
    return false;
  }

  return session.accessToken === token;
}

async updateSessionActivity(userId: string) {
  const session: any = await this.getSession(userId);
  
  if (session) {
    session.lastActivity = new Date().toISOString();
    await this.cacheManager.set(`user:session:${userId}`, session, 86400);
  }
}


}
