import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);
  private isConnected = false;

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    try {
      const topics = [
        'bookings.created',
        'bookings.confirmed',
        'bookings.cancelled',
        'bookings.completed',
        'payments.completed',
        'payments.failed',
        'notifications.send',
        'chat.messages',
      ];

      topics.forEach((topic) => {
        this.kafkaClient.subscribeToResponseOf(topic);
      });

      await this.kafkaClient.connect();
      this.isConnected = true;
      this.logger.log('Kafka connected successfully');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn('Kafka connection failed. Running without Kafka.');
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error: ${errorMessage}`);
    }
  }

  async emit(topic: string, data: any) {
    if (!this.isConnected) {
      this.logger.warn(`Kafka not connected. Skipping emit to topic: ${topic}`);
      return;
    }

    try {
      await this.kafkaClient.emit(topic, data).toPromise();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to emit to topic ${topic}: ${errorMessage}`);
    }
  }

  async sendBookingCreated(booking: any) {
    return this.emit('bookings.created', booking);
  }

  async sendBookingConfirmed(booking: any) {
    return this.emit('bookings.confirmed', booking);
  }

  async sendBookingCancelled(booking: any) {
    return this.emit('bookings.cancelled', booking);
  }

  async sendBookingCompleted(booking: any) {
    return this.emit('bookings.completed', booking);
  }

  async sendPaymentCompleted(payment: any) {
    return this.emit('payments.completed', payment);
  }

  async sendPaymentFailed(payment: any) {
    return this.emit('payments.failed', payment);
  }

  async sendNotification(notification: any) {
    return this.emit('notifications.send', notification);
  }

  async sendChatMessage(message: any) {
    return this.emit('chat.messages', message);
  }
}
