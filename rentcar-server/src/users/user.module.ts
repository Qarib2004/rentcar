import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RedisSessionGuard } from 'src/auth/guards/redis-session.guard';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports:[RedisModule],
  controllers: [UserController],
  providers: [UserService,RedisSessionGuard],
  exports: [UserService],
})
export class UserModule {}
