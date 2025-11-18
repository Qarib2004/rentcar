import { Injectable } from '@nestjs/common';
import { PrismaService } from '../databases/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCars,
      totalBookings,
      totalRevenue,
      activeBookings,
      pendingBookings,
      totalReviews,
      averageRating,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.car.count({ where: { isActive: true } }),
      this.prisma.booking.count(),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.booking.count({ where: { status: 'ACTIVE' } }),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.review.count(),
      this.prisma.review.aggregate({
        _avg: { rating: true },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        clients: await this.prisma.user.count({
          where: { role: UserRole.CLIENT },
        }),
        owners: await this.prisma.user.count({
          where: { role: UserRole.OWNER },
        }),
      },
      cars: {
        total: totalCars,
        available: await this.prisma.car.count({
          where: { status: 'AVAILABLE', isActive: true },
        }),
        rented: await this.prisma.car.count({
          where: { status: 'RENTED' },
        }),
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        pending: pendingBookings,
        completed: await this.prisma.booking.count({
          where: { status: 'COMPLETED' },
        }),
      },
      revenue: {
        total: Number(totalRevenue._sum.amount || 0),
        thisMonth: await this.getMonthlyRevenue(),
      },
      reviews: {
        total: totalReviews,
        averageRating: Math.round((averageRating._avg.rating || 0) * 10) / 10,
      },
    };
  }

  async getMonthlyRevenue() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  }

  async getBookingStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      select: {
        status: true,
        totalPrice: true,
        createdAt: true,
      },
    });

    const stats = {
      total: bookings.length,
      byStatus: {
        PENDING: 0,
        CONFIRMED: 0,
        ACTIVE: 0,
        COMPLETED: 0,
        CANCELLED: 0,
        REJECTED: 0,
      },
      totalRevenue: 0,
    };

    bookings.forEach((booking) => {
      stats.byStatus[booking.status] =
        (stats.byStatus[booking.status] || 0) + 1;
      if (booking.status === 'COMPLETED') {
        stats.totalRevenue += Number(booking.totalPrice);
      }
    });

    return stats;
  }

  async getCarStats() {
    const cars = await this.prisma.car.findMany({
      include: {
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    const stats = {
      total: cars.length,
      byStatus: {
        AVAILABLE: 0,
        RENTED: 0,
        MAINTENANCE: 0,
        UNAVAILABLE: 0,
      },
      averageBookings: 0,
      averageRating: 0,
      topRated: cars
        .filter((car) => car.totalReviews > 0)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 10)
        .map((car) => ({
          id: car.id,
          brand: car.brand,
          model: car.model,
          rating: car.averageRating,
          reviews: car.totalReviews,
        })),
    };

    let totalBookings = 0;
    let totalRating = 0;
    let ratedCars = 0;

    cars.forEach((car) => {
      stats.byStatus[car.status] = (stats.byStatus[car.status] || 0) + 1;
      totalBookings += car._count.bookings;
      if (car.averageRating > 0) {
        totalRating += car.averageRating;
        ratedCars++;
      }
    });

    stats.averageBookings = cars.length > 0 ? totalBookings / cars.length : 0;
    stats.averageRating = ratedCars > 0 ? totalRating / ratedCars : 0;

    return stats;
  }

  async getUserStats() {
    const users = await this.prisma.user.findMany({
      include: {
        _count: {
          select: {
            bookings: true,
            reviews: true,
            ownedCars: true,
          },
        },
      },
    });

    return {
      total: users.length,
      byRole: {
        CLIENT: users.filter((u) => u.role === UserRole.CLIENT).length,
        OWNER: users.filter((u) => u.role === UserRole.OWNER).length,
        ADMIN: users.filter((u) => u.role === UserRole.ADMIN).length,
      },
      verified: users.filter((u) => u.isVerified).length,
      active: users.filter((u) => u.isActive).length,
      averageBookings:
        users.length > 0
          ? users.reduce((sum, u) => sum + u._count.bookings, 0) / users.length
          : 0,
    };
  }
}

