import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class RedisSessionGuard implements CanActivate {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; 
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!userId || !token) {
      throw new UnauthorizedException('Invalid session');
    }

    const sessionKey = `user:session:${userId}`;
    const session: any = await this.cacheManager.get(sessionKey);

    if (!session) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    if (session.accessToken !== token) {
      throw new UnauthorizedException('Token mismatch');
    }

    return true;
  }
}