import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CarStatus, UserRole } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateCarSwaggerDto } from './dto/create-car-swagger.dto';
import { CurrentUser } from 'src/common/decorators/cureent-user.decorator';
import { CreateCarDto } from './dto/create-car.dto';
import { FilterCarDto } from './dto/filter-car.dto';
import { Public } from 'src/common/decorators/public.decoarator';
import { UpdateCarDto } from './dto/update-car.dto';

@ApiTags('cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new car (Owner/Admin only)' })
  @ApiBody({ type: CreateCarSwaggerDto })
  @ApiResponse({ status: 201, description: 'Car created successfully' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createCarDto: CreateCarDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.carsService.create(userId, createCarDto, images);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all cars with filters' })
  @ApiResponse({ status: 200, description: 'List of cars' })
  async findAll(@Query() filterDto: FilterCarDto) {
    return this.carsService.findAll(filterDto);
  }

  @Get('my-cars')
  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get my owned cars (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'List of owned cars' })
  async findMyOwnedCars(
    @CurrentUser('id') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.carsService.findMyOwnedCars(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get car by ID' })
  @ApiResponse({ status: 200, description: 'Car found' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update car (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Car updated successfully' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() updateCarDto: UpdateCarDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.carsService.update(id, userId, userRole, updateCarDto, images);
  }

  @Delete(':id/images')
  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete car image (Owner/Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', example: 'https://res.cloudinary.com/...' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async deleteImage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.carsService.deleteImage(id, userId, userRole, imageUrl);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update car status (Owner/Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Car status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body('status') status: CarStatus,
  ) {
    return this.carsService.updateStatus(id, userId, userRole, status);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete car (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Car deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.carsService.remove(id, userId, userRole);
  }
}
