import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { CloudinaryService } from 'src/uploads/cloudinary.service';
import { CreateCarDto } from './dto/create-car.dto';
import { CarStatus, Prisma, UserRole } from '@prisma/client';
import { FilterCarDto } from './dto/filter-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CarsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    ownerId: string,
    createCarDto: CreateCarDto,
    images?: Express.Multer.File[],
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id: createCarDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Car not found');
    }

    const existingCar = await this.prisma.car.findUnique({
      where: { licensePlate: createCarDto.licensePlate },
    });

    if (existingCar) {
      throw new BadRequestException('Car with license plate already axists');
    }

    let imageUrls: string[] = [];
    if (images && images.length > 0) {
      imageUrls = await this.cloudinaryService.uploadMultipleImages(
        images,
        'car-rental/cars',
      );
    }

    const car = await this.prisma.car.create({
      data: {
        ...createCarDto,
        ownerId,
        images: imageUrls,
      },
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
        category: true,
      },
    });

    return car;
  }

  async findAll(filterDto: FilterCarDto) {
    const {
      brand,
      model,
      categoryId,
      transmission,
      fuelType,
      status,
      seats,
      minPrice,
      maxPrice,
      location,
      year,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const skip = (page - 1) * limit;

    const where: Prisma.CarWhereInput = {
      isActive: true,
    };

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (transmission) {
      where.transmission = transmission;
    }

    if (fuelType) {
      where.fuelType = fuelType;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = CarStatus.AVAILABLE;
    }

    if (seats) {
      where.seats = seats;
    }

    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = minPrice;
      if (maxPrice) where.pricePerDay.lte = maxPrice;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (year) {
      where.year = year;
    }

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [cars, total] = await Promise.all([
      this.prisma.car.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          category: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.car.count({ where }),
    ]);

    return {
      data: cars,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {

    const cacheKey = `cars:${id}`;


    const car = await this.prisma.car.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, car, 300); 

    return car;
  }

  async findMyOwnedCars(ownerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [cars, total] = await Promise.all([
      this.prisma.car.findMany({
        where: { ownerId },
        skip,
        take: limit,
        include: {
          category: true,
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.car.count({ where: { ownerId } }),
    ]);

    return {
      data: cars,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateCarDto: UpdateCarDto,
    newImages?: Express.Multer.File[],
  ) {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    if (car.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to update this car',
      );
    }

    let newImageUrls: string[] = [];
    if (newImages && newImages.length > 0) {
      newImageUrls = await this.cloudinaryService.uploadMultipleImages(
        newImages,
        'car-rental/cars',
      );
    }

    const updatedCar = await this.prisma.car.update({
      where: { id },
      data: {
        ...updateCarDto,
        images:
          newImageUrls.length > 0
            ? [...car.images, ...newImageUrls]
            : undefined,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
      },
    });

    await this.cacheManager.del(`car:${id}`);

    return updatedCar;
  }

  async deleteImage(
    carId: string,
    userId: string,
    userRole: UserRole,
    imageUrl: string,
  ) {
    const car = await this.prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    if (car.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete this image',
      );
    }

    if (!car.images.includes(imageUrl)) {
      throw new BadRequestException('Image not found in car images');
    }

    await this.cloudinaryService.deleteImage(imageUrl);

    const updatedImages = car.images.filter((img) => img !== imageUrl);
    await this.prisma.car.update({
      where: { id: carId },
      data: { images: updatedImages },
    });

    return { message: 'Image deleted successfully' };
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    if (car.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete this car',
      );
    }

    if (car.images && car.images.length > 0) {
      await this.cloudinaryService.deleteMultipleImages(car.images);
    }

    await this.prisma.car.delete({
      where: { id },
    });

    await this.cacheManager.del(`car:${id}`);

    return { message: 'Car deleted successfully' };
  }

  async updateStatus(
    id: string,
    userId: string,
    userRole: UserRole,
    status: CarStatus,
  ) {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    if (car.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to update this car status',
      );
    }

    return this.prisma.car.update({
      where: { id },
      data: { status },
    });
  }
}
