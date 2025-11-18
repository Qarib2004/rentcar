import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaProducerService } from './kafka-producer.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId:
                configService.get<string>('kafka.clientId') ??
                'car-rental-service',
              brokers: [
                configService.get<string>('kafka.broker') ?? 'localhost:9092',
              ],
            },
            consumer: {
              groupId:
                configService.get<string>('kafka.groupId') ??
                'car-rental-group',
            },
          },
        }),
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService, ClientsModule],
})
export class KafkaModule {}
