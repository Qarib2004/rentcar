import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../databases/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { bookingId, rating, comment } = createReviewDto;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: true,
        review: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException(
        'You can only review your own bookings',
      );
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'You can only review completed bookings',
      );
    }

    if (booking.review) {
      throw new BadRequestException('Review already exists for this booking');
    }

    const review = await this.prisma.review.create({
      data: {
        bookingId,
        userId,
        carId: booking.carId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
          },
        },
      },
    });

    await this.updateCarRating(booking.carId);

    return review;
  }

  async findAll(carId?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const where: { carId?: string } = {};
    if (carId) {
      where.carId = carId;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          car: {
            select: {
              id: true,
              brand: true,
              model: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
          },
        },
        booking: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
          },
        },
      },
    });

    if (updateReviewDto.rating) {
      await this.updateCarRating(review.carId);
    }

    return updatedReview;
  }

  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const carId = review.carId;

    await this.prisma.review.delete({
      where: { id },
    });

    await this.updateCarRating(carId);

    return { message: 'Review deleted successfully' };
  }

  private async updateCarRating(carId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { carId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      await this.prisma.car.update({
        where: { id: carId },
        data: {
          averageRating: 0,
          totalReviews: 0,
        },
      });
      return;
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) /
      reviews.length;

    await this.prisma.car.update({
      where: { id: carId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
      },
    });
  }
}

