import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, CarStatus, UserRole, Prisma } from '@prisma/client';
import { FilterBookingDto } from './dto/filter-booking.dto';
import { ValidationUtil } from '../common/utils/validation.util';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(userId: string, craeteBookingDto: CreateBookingDto) {
    const { carId, startDate, endDate, notes, pickupLocation, returnLocation } =
      craeteBookingDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        licenseNumber: true,
        licenseExpiry: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isVerified) {
      throw new BadRequestException(
        'Please verify your email before making a booking',
      );
    }

    ValidationUtil.validateLicense(user.licenseNumber, user.licenseExpiry);

    const car = await this.prisma.car.findUnique({
      where: { id: carId },
      include: {
        owner: true,
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (!car.isActive) {
      throw new BadRequestException('Car is not available for booking');
    }

    if (car.status !== CarStatus.AVAILABLE) {
      throw new BadRequestException(
        `Car is currently ${car.status.toLowerCase()}`,
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      throw new BadRequestException('End date must be after start date');
    }

    if (start < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        carId,
        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.ACTIVE,
          ],
        },
        OR: [
          {
            AND: [{ startDate: { lte: start } }, { endDate: { gte: start } }],
          },
          {
            AND: [{ startDate: { lte: end } }, { endDate: { gte: end } }],
          },
          {
            AND: [{ startDate: { gte: start } }, { endDate: { lte: end } }],
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException(
        'Car is already booked for the selected dates',
      );
    }

    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = Number(car.pricePerDay) * totalDays;

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        carId,
        startDate: start,
        endDate: end,
        pricePerDay: car.pricePerDay,
        totalDays,
        totalPrice,
        deposit: car.deposit,
        notes,
        pickupLocation,
        returnLocation,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        car: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    await this.kafkaProducer.sendBookingCreated({
      bookingId: booking.id,
      userId: booking.userId,
      carId: booking.carId,
      ownerId: car.ownerId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalPrice: booking.totalPrice,
    });

    return booking;
  }

  async findAll(filterDto: FilterBookingDto) {
    const {
      status,
      carId,
      userId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (carId) {
      where.carId = carId;
    }

    if (userId) {
      where.userId = userId;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          car: {
            include: {
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
        car: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findMyBookings(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          car: {
            include: {
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
            },
          },
          payment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.booking.count({ where: { userId } }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOwnerBookings(
    ownerId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          car: {
            ownerId,
          },
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          car: true,
          payment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.booking.count({
        where: {
          car: {
            ownerId,
          },
        },
      }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  async confirmBooking(id: string, userId: string, userRole: UserRole) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        car: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Проверка прав: Только владелец машины или администратор могут активировать
    if (booking.car.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to activate this booking',
      );
    }

    // Проверка статуса: Активировать можно только CONFIRMED
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        `Cannot activate booking with status ${booking.status}. It must be CONFIRMED.`,
      );
    }

    const activatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.ACTIVE,
      },
      include: {
        user: true,
        car: true,
      },
    });

    // Обновляем статус машины на RENTED
    await this.prisma.car.update({
      where: { id: booking.carId },
      data: { status: CarStatus.RENTED },
    });

    await this.kafkaProducer.sendBookingConfirmed({
      bookingId: activatedBooking.id,
      userId: activatedBooking.userId,
      carId: activatedBooking.carId,
    });

    return activatedBooking;
  }

  /**
   * Активирует бронирование (CONFIRMED → ACTIVE)
   * Используется когда клиент забирает машину
   */
  async activateBooking(id: string, userId: string, userRole: UserRole) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        car: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Проверка прав: Только владелец машины или администратор могут активировать
    if (booking.car.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to activate this booking',
      );
    }

    // Проверка статуса: Активировать можно только CONFIRMED
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        `Cannot activate booking with status ${booking.status}. It must be CONFIRMED.`,
      );
    }

    const activatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.ACTIVE,
      },
      include: {
        user: true,
        car: true,
      },
    });

    // Обновляем статус машины на RENTED
    await this.prisma.car.update({
      where: { id: booking.carId },
      data: { status: CarStatus.RENTED },
    });

    return activatedBooking;
  }

  async cancelBooking(id: string, userId: string, userRole: UserRole) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        car: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      booking.userId !== userId &&
      booking.car.ownerId !== userId &&
      userRole !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to cancel this booking',
      );
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestException(
        `Cannot cancel booking with status ${booking.status}`,
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        user: true,
        car: true,
      },
    });

    await this.kafkaProducer.sendBookingCancelled({
      bookingId: updatedBooking.id,
      userId: updatedBooking.userId,
      carId: updatedBooking.carId,
    });

    return updatedBooking;
  }

  async completeBooking(id: string, userId: string, userRole: UserRole) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        car: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.car.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to complete this booking',
      );
    }

    if (booking.status !== BookingStatus.ACTIVE && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        `Cannot complete booking with status ${booking.status}. Only CONFIRMED or ACTIVE bookings can be completed.`,
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        user: true,
        car: true,
      },
    });

    await this.prisma.car.update({
      where: { id: booking.carId },
      data: { status: CarStatus.AVAILABLE },
    });

    await this.kafkaProducer.sendBookingCompleted({
      bookingId: updatedBooking.id,
      userId: updatedBooking.userId,
      carId: updatedBooking.carId,
    });

    return updatedBooking;
  }

  async checkAvailability(carId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        carId,
        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.ACTIVE,
          ],
        },
        OR: [
          {
            AND: [{ startDate: { lte: start } }, { endDate: { gte: start } }],
          },
          {
            AND: [{ startDate: { lte: end } }, { endDate: { gte: end } }],
          },
          {
            AND: [{ startDate: { gte: start } }, { endDate: { lte: end } }],
          },
        ],
      },
    });

    return {
      available: !conflictingBooking,
      conflictingBooking: conflictingBooking || null,
    };
  }
}
// import {
//   BadRequestException,
//   ForbiddenException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { PrismaService } from 'src/databases/prisma.service';
// import { KafkaProducerService } from 'src/kafka/kafka-producer.service';
// import { CreateBookingDto } from './dto/create-booking.dto';
// import { BookingStatus, CarStatus, UserRole, Prisma } from '@prisma/client';
// import { FilterBookingDto } from './dto/filter-booking.dto';
// import { ValidationUtil } from '../common/utils/validation.util';

// @Injectable()
// export class BookingService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly kafkaProducer: KafkaProducerService,
//   ) {}

//   async create(userId: string, craeteBookingDto: CreateBookingDto) {
//     const { carId, startDate, endDate, notes, pickupLocation, returnLocation } =
//       craeteBookingDto;

//     const user = await this.prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         licenseNumber: true,
//         licenseExpiry: true,
//         isVerified: true,
//       },
//     });

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     if (!user.isVerified) {
//       throw new BadRequestException(
//         'Please verify your email before making a booking',
//       );
//     }

//     ValidationUtil.validateLicense(user.licenseNumber, user.licenseExpiry);

//     const car = await this.prisma.car.findUnique({
//       where: { id: carId },
//       include: {
//         owner: true,
//       },
//     });

//     if (!car) {
//       throw new NotFoundException('Car not found');
//     }

//     if (!car.isActive) {
//       throw new BadRequestException('Car is not available for booking');
//     }

//     if (car.status !== CarStatus.AVAILABLE) {
//       throw new BadRequestException(
//         `Car is currently ${car.status.toLowerCase()}`,
//       );
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const now = new Date();

//     if (start >= end) {
//       throw new BadRequestException('End date must be after start date');
//     }

//     if (start < now) {
//       throw new BadRequestException('Start date cannot be in the past');
//     }

//     const conflictingBooking = await this.prisma.booking.findFirst({
//       where: {
//         carId,
//         status: {
//           in: [
//             BookingStatus.PENDING,
//             BookingStatus.CONFIRMED,
//             BookingStatus.ACTIVE,
//           ],
//         },
//         OR: [
//           {
//             AND: [{ startDate: { lte: start } }, { endDate: { gte: start } }],
//           },
//           {
//             AND: [{ startDate: { lte: end } }, { endDate: { gte: end } }],
//           },
//           {
//             AND: [{ startDate: { gte: start } }, { endDate: { lte: end } }],
//           },
//         ],
//       },
//     });

//     if (conflictingBooking) {
//       throw new BadRequestException(
//         'Car is already booked for the selected dates',
//       );
//     }

//     const totalDays = Math.ceil(
//       (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
//     );
//     const totalPrice = Number(car.pricePerDay) * totalDays;

//     const booking = await this.prisma.booking.create({
//       data: {
//         userId,
//         carId,
//         startDate: start,
//         endDate: end,
//         pricePerDay: car.pricePerDay,
//         totalDays,
//         totalPrice,
//         deposit: car.deposit,
//         notes,
//         pickupLocation,
//         returnLocation,
//         status: BookingStatus.CONFIRMED,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             phone: true,
//           },
//         },
//         car: {
//           include: {
//             owner: {
//               select: {
//                 id: true,
//                 email: true,
//                 firstName: true,
//                 lastName: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     await this.kafkaProducer.sendBookingCreated({
//       bookingId: booking.id,
//       userId: booking.userId,
//       carId: booking.carId,
//       ownerId: car.ownerId,
//       startDate: booking.startDate,
//       endDate: booking.endDate,
//       totalPrice: booking.totalPrice,
//     });

//     return booking;
//   }

//   async findAll(filterDto: FilterBookingDto) {
//     const {
//       status,
//       carId,
//       userId,
//       page = 1,
//       limit = 10,
//       sortBy = 'createdAt',
//       sortOrder = 'desc',
//     } = filterDto;

//     const skip = (page - 1) * limit;

//     const where: Prisma.BookingWhereInput = {};

//     if (status) {
//       where.status = status;
//     }

//     if (carId) {
//       where.carId = carId;
//     }

//     if (userId) {
//       where.userId = userId;
//     }

//     const [bookings, total] = await Promise.all([
//       this.prisma.booking.findMany({
//         where,
//         skip,
//         take: limit,
//         include: {
//           user: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               email: true,
//               phone: true,
//             },
//           },
//           car: {
//             include: {
//               owner: {
//                 select: {
//                   id: true,
//                   firstName: true,
//                   lastName: true,
//                 },
//               },
//             },
//           },
//         },
//         orderBy: {
//           [sortBy]: sortOrder,
//         },
//       }),
//       this.prisma.booking.count({ where }),
//     ]);

//     return {
//       data: bookings,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   async findOne(id: string) {
//     const booking = await this.prisma.booking.findUnique({
//       where: { id },
//       include: {
//         user: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             phone: true,
//             avatar: true,
//           },
//         },
//         car: {
//           include: {
//             owner: {
//               select: {
//                 id: true,
//                 email: true,
//                 firstName: true,
//                 lastName: true,
//                 phone: true,
//               },
//             },
//           },
//         },
//         payment: true,
//       },
//     });

//     if (!booking) {
//       throw new NotFoundException(`Booking with ID ${id} not found`);
//     }

//     return booking;
//   }

//   async findMyBookings(userId: string, page: number = 1, limit: number = 10) {
//     const skip = (page - 1) * limit;

//     const [bookings, total] = await Promise.all([
//       this.prisma.booking.findMany({
//         where: { userId },
//         skip,
//         take: limit,
//         include: {
//           car: {
//             include: {
//               owner: {
//                 select: {
//                   id: true,
//                   firstName: true,
//                   lastName: true,
//                   phone: true,
//                 },
//               },
//             },
//           },
//           payment: true,
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       }),

//       this.prisma.booking.count({ where: { userId } }),
//     ]);

//     return {
//       data: bookings,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   async findOwnerBookings(
//     ownerId: string,
//     page: number = 1,
//     limit: number = 10,
//   ) {
//     const skip = (page - 1) * limit;

//     const [bookings, total] = await Promise.all([
//       this.prisma.booking.findMany({
//         where: {
//           car: {
//             ownerId,
//           },
//         },
//         skip,
//         take: limit,
//         include: {
//           user: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               email: true,
//               phone: true,
//             },
//           },
//           car: true,
//           payment: true,
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       }),
//       this.prisma.booking.count({
//         where: {
//           car: {
//             ownerId,
//           },
//         },
//       }),
//     ]);

//     return {
//       data: bookings,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

// // BookingService
//   async confirmBooking(id: string, userId: string, userRole: UserRole) {
//       const booking = await this.prisma.booking.findUnique({
//         where: { id },
//         include: {
//           car: {
//             include: {
//               owner: true,
//             },
//           },
//         },
//       });
//     
//       if (!booking) {
//         throw new NotFoundException('Booking not found');
//       }
//     
//       // Проверка прав: Только владелец машины или администратор могут активировать бронирование.
//       if (booking.car.ownerId !== userId && userRole !== UserRole.ADMIN) {
//         throw new ForbiddenException(
//           'You do not have permission to confirm this booking',
//         );
//       }
//     
//       // Проверка статуса: Активировать можно только PENDING или CONFIRMED.
//       if (
//         booking.status !== BookingStatus.PENDING &&
//         booking.status !== BookingStatus.CONFIRMED
//       ) {
//         throw new BadRequestException(
//           `Cannot activate booking with status ${booking.status}. It must be PENDING or CONFIRMED.`,
//         );
//       }
//     
//       // Одно обновление: Переводим статус сразу в ACTIVE
//       const activatedBooking = await this.prisma.booking.update({
//         where: { id },
//         data: {
//           status: BookingStatus.ACTIVE, // Устанавливаем целевой статус ACTIVE
//           confirmedAt: new Date(), // Устанавливаем время активации/подтверждения
//         },
//         include: {
//           user: true,
//           car: true,
//         },
//       });
//     
//       // Отправка сообщения в Kafka о том, что бронирование активировано
//       await this.kafkaProducer.sendBookingConfirmed({
//         bookingId: activatedBooking.id,
//         userId: activatedBooking.userId,
//         carId: activatedBooking.carId,
//       });
//     
//       // Возвращаем бронирование в статусе ACTIVE
//       return activatedBooking;
//     }
  

//   async cancelBooking(id: string, userId: string, userRole: UserRole) {
//     const booking = await this.prisma.booking.findUnique({
//       where: { id },
//       include: {
//         car: true,
//       },
//     });

//     if (!booking) {
//       throw new NotFoundException('Booking not found');
//     }

//     if (
//       booking.userId !== userId &&
//       booking.car.ownerId !== userId &&
//       userRole !== UserRole.ADMIN
//     ) {
//       throw new ForbiddenException(
//         'You do not have permission to cancel this booking',
//       );
//     }

//     if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
//       throw new BadRequestException(
//         `Cannot cancel booking with status ${booking.status}`,
//       );
//     }

//     const updatedBooking = await this.prisma.booking.update({
//       where: { id },
//       data: {
//         status: BookingStatus.CANCELLED,
//         cancelledAt: new Date(),
//       },
//       include: {
//         user: true,
//         car: true,
//       },
//     });

//     await this.kafkaProducer.sendBookingCancelled({
//       bookingId: updatedBooking.id,
//       userId: updatedBooking.userId,
//       carId: updatedBooking.carId,
//     });

//     return updatedBooking;
//   }

//   async completeBooking(id: string, userId: string, userRole: UserRole) {
//     const booking = await this.prisma.booking.findUnique({
//       where: { id },
//       include: {
//         car: true,
//       },
//     });

//     if (!booking) {
//       throw new NotFoundException('Booking not found');
//     }

//     if (booking.car.ownerId !== userId && userRole !== UserRole.ADMIN) {
//       throw new ForbiddenException(
//         'You do not have permission to complete this booking',
//       );
//     }

//     if (booking.status !== BookingStatus.ACTIVE) {
//       throw new BadRequestException('Only active bookings can be completed');
//     }

//     const updatedBooking = await this.prisma.booking.update({
//       where: { id },
//       data: {
//         status: BookingStatus.COMPLETED,
//         completedAt: new Date(),
//       },
//       include: {
//         user: true,
//         car: true,
//       },
//     });

//     await this.prisma.car.update({
//       where: { id: booking.carId },
//       data: { status: CarStatus.AVAILABLE },
//     });

//     await this.kafkaProducer.sendBookingCompleted({
//       bookingId: updatedBooking.id,
//       userId: updatedBooking.userId,
//       carId: updatedBooking.carId,
//     });

//     return updatedBooking;
//   }

//   async checkAvailability(carId: string, startDate: string, endDate: string) {
//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     const conflictingBooking = await this.prisma.booking.findFirst({
//       where: {
//         carId,
//         status: {
//           in: [
//             BookingStatus.PENDING,
//             BookingStatus.CONFIRMED,
//             BookingStatus.ACTIVE,
//           ],
//         },
//         OR: [
//           {
//             AND: [{ startDate: { lte: start } }, { endDate: { gte: start } }],
//           },
//           {
//             AND: [{ startDate: { lte: end } }, { endDate: { gte: end } }],
//           },
//           {
//             AND: [{ startDate: { gte: start } }, { endDate: { lte: end } }],
//           },
//         ],
//       },
//     });

//     return {
//       available: !conflictingBooking,
//       conflictingBooking: conflictingBooking || null,
//     };
//   }
// }
