import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FilterBookingDto } from './dto/filter-booking.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { BookingService } from './booking.service';
import { CurrentUser } from 'src/common/decorators/cureent-user.decorator';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request (car not available, invalid dates, etc.)',
  })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(userId, createBookingDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  async findAll(@Query() filterDto: FilterBookingDto) {
    return this.bookingsService.findAll(filterDto);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get my bookings as a client' })
  @ApiResponse({ status: 200, description: 'List of user bookings' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findMyBookings(
    @CurrentUser('id') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.bookingsService.findMyBookings(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('owner-bookings')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get bookings for my cars as owner' })
  @ApiResponse({ status: 200, description: 'List of owner bookings' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findOwnerBookings(
    @CurrentUser('id') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.bookingsService.findOwnerBookings(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('check-availability/:carId')
  @ApiOperation({ summary: 'Check car availability for specific dates' })
  @ApiResponse({ status: 200, description: 'Availability status' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    example: '2025-10-25T10:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    example: '2025-10-30T10:00:00Z',
  })
  async checkAvailability(
    @Param('carId') carId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.bookingsService.checkAvailability(carId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking found' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm booking (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async confirmBooking(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.bookingsService.confirmBooking(id, userId, userRole);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  async cancelBooking(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.bookingsService.cancelBooking(id, userId, userRole);
  }

  @Patch(':id/complete')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete booking (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking completed successfully' })
  async completeBooking(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.bookingsService.completeBooking(id, userId, userRole);
  }
}
