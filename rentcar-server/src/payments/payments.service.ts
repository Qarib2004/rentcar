import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, BookingStatus, CarStatus } from '@prisma/client';
import { PrismaService } from 'src/databases/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (!secretKey) {
      throw new Error('Stripe secret key not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createCheckoutSession(
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ) {
    const { bookingId, successUrl, cancelUrl } = createPaymentDto;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to pay for this booking',
      );
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking must be confirmed before payment');
    }

    if (booking.payment) {
      throw new BadRequestException('Payment already exists for this booking');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${booking.car.brand} ${booking.car.model}`,
              description: `Booking from ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}`,
              images: booking.car.images.slice(0, 1),
            },
            unit_amount: Math.round(Number(booking.totalPrice) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url:
        successUrl ||
        `${this.configService.get('cors.origin')}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${this.configService.get('cors.origin')}/booking/cancel`,
      metadata: {
        bookingId: booking.id,
        userId: userId,
      },
    });

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: userId,
        amount: booking.totalPrice,
        currency: 'USD',
        status: PaymentStatus.PENDING,
        stripeSessionId: session.id,
        paymentMethod: 'card',
        description: `Payment for booking ${booking.id}`,
      },
    });

    return {
      sessionId: session.id,
      sessionUrl: session.url,
      payment,
    };
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'stripe.webhookSecret',
    );

    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured');
      }
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new BadRequestException(`Webhook Error: ${errorMessage}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    if (!session.metadata) {
      throw new BadRequestException('Session metadata is missing');
    }

    const bookingId = session.metadata.bookingId;
    const userId = session.metadata.userId;

    if (!bookingId || !userId) {
      throw new BadRequestException(
        'Booking ID or User ID is missing in session metadata',
      );
    }

    const payment = await this.prisma.payment.update({
      where: { stripeSessionId: session.id },
      data: {
        status: PaymentStatus.COMPLETED,
        stripePaymentId: session.payment_intent as string,
        paidAt: new Date(),
      },
      include: {
        booking: {
          include: {
            car: true,
          },
        },
      },
    });

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.ACTIVE },
    });

    await this.prisma.car.update({
      where: { id: payment.booking.carId },
      data: { status: CarStatus.RENTED },
    });

    await this.kafkaProducer.sendPaymentCompleted({
      paymentId: payment.id,
      bookingId: bookingId,
      userId: userId,
      amount: Number(payment.amount),
    });
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      await this.kafkaProducer.sendPaymentFailed({
        paymentId: payment.id,
        bookingId: payment.bookingId,
        userId: payment.userId,
      });
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          booking: {
            include: {
              car: {
                select: {
                  id: true,
                  brand: true,
                  model: true,
                  licensePlate: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            car: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findMyPayments(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          booking: {
            include: {
              car: {
                select: {
                  id: true,
                  brand: true,
                  model: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async refundPayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    if (!payment.stripePaymentId) {
      throw new BadRequestException('No Stripe payment ID found');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
    });

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      },
    });

    return {
      payment: updatedPayment,
      refund,
    };
  }
}
