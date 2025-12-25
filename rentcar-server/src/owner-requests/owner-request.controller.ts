import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
  } from '@nestjs/swagger';
  import { CreateOwnerRequestDto } from './dto/create-owner-request.dto';
  import { Roles } from '../common/decorators/roles.decorator';
  import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/cureent-user.decorator';
import { OwnerRequestsService } from './owner-request.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ReviewOwnerRequestDto } from './dto/review-owner-requets';
  
  @ApiTags('owner-requests')
  @Controller('owner-requests')
  @ApiBearerAuth()
  export class OwnerRequestsController {
    constructor(private readonly ownerRequestsService: OwnerRequestsService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create owner request' })
    @ApiResponse({ status: 201, description: 'Request created successfully' })
    async createRequest(
      @CurrentUser('id') userId: string,
      @Body() dto: CreateOwnerRequestDto,
    ) {
      return this.ownerRequestsService.createRequest(userId, dto);
    }
  
    @Get('my-request')
    @ApiOperation({ summary: 'Get my owner request' })
    @ApiResponse({ status: 200, description: 'Request details' })
    async getMyRequest(@CurrentUser('id') userId: string) {
      return this.ownerRequestsService.getMyRequest(userId);
    }
  
    @Delete('my-request')
    @ApiOperation({ summary: 'Cancel my pending request' })
    @ApiResponse({ status: 200, description: 'Request cancelled' })
    async cancelRequest(@CurrentUser('id') userId: string) {
      return this.ownerRequestsService.cancelRequest(userId);
    }
  
    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all owner requests (Admin only)' })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    @ApiResponse({ status: 200, description: 'List of requests' })
    async getAllRequests(@Query('status') status?: string) {
      return this.ownerRequestsService.getAllRequests(status);
    }
  
    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get request by ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'Request details' })
    async getRequestById(@Param('id') id: string) {
      return this.ownerRequestsService.getRequestById(id);
    }
  
    @Patch(':id/review')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Review owner request (Admin only)' })
    @ApiResponse({ status: 200, description: 'Request reviewed' })
    async reviewRequest(
      @Param('id') id: string,
      @CurrentUser('id') adminId: string,
      @Body() dto: ReviewOwnerRequestDto,
    ) {
      return this.ownerRequestsService.reviewRequest(id, adminId, dto);
    }
  }