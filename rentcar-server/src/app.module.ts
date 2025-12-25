import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import configuration from './config/configuration';
import { DatabaseModule } from './databases/database.module';
import { RedisModule } from './redis/redis.module';
import { KafkaModule } from './kafka/kafka.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { CarsModule } from './cars/cars.module';
import { BookingsModule } from './bookings/booking.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { StatisticsModule } from './statistics/statistics.module';
import { WebSocketModule } from './websocket/websocket.module';
import { OwnerRequestsModule } from './owner-requests/owner-request.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    ScheduleModule.forRoot(),

    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10) || 6379,
      },
    }),

    DatabaseModule,
    RedisModule,
    KafkaModule,
    UploadsModule,
    AuthModule,
    UserModule,
    CarsModule,
    BookingsModule,
    PaymentsModule,
    HealthModule,
    MailModule,
    ReviewsModule,
    NotificationsModule,
    ChatModule,
    StatisticsModule,
    WebSocketModule,
    OwnerRequestsModule
  ],
})
export class AppModule {}
