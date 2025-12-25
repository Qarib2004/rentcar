import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
  } from '@nestjs/common';
  import { CreateOwnerRequestDto } from './dto/create-owner-request.dto';
  import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/databases/prisma.service';
import { ReviewOwnerRequestDto } from './dto/review-owner-requets';
  
  @Injectable()
  export class OwnerRequestsService {
    constructor(private prisma: PrismaService) {}
  
    async createRequest(userId: string, dto: CreateOwnerRequestDto) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { ownerRequests: true },
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      if (user.role === UserRole.OWNER || user.role === UserRole.ADMIN) {
        throw new BadRequestException('You already have owner privileges');
      }
  
      if (user.ownerRequests && user.ownerRequests?.some(req => req.status === 'PENDING')) {
        throw new BadRequestException('You already have a pending request');
      }
  
      const request = await this.prisma.ownerRequest.create({
        data: {
          userId,
          message: dto.message,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });
  
      return request;
    }
  
    async getMyRequest(userId: string) {
      const request = await this.prisma.ownerRequest.findFirst({
        where: { userId },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
  
      return request;
    }
  
    async getAllRequests(status?: string) {
      const where: any = {};
  
      if (status) {
        where.status = status;
      }
  
      const requests = await this.prisma.ownerRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
              role: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
  
      return requests;
    }
  
    async getRequestById(requestId: string) {
      const request = await this.prisma.ownerRequest.findUnique({
        where: { id: requestId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
              role: true,
              createdAt: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
  
      if (!request) {
        throw new NotFoundException('Request not found');
      }
  
      return request;
    }
  
    async reviewRequest(
      requestId: string,
      adminId: string,
      dto: ReviewOwnerRequestDto,
    ) {
      const request = await this.prisma.ownerRequest.findUnique({
        where: { id: requestId },
        include: { user: true },
      });
  
      if (!request) {
        throw new NotFoundException('Request not found');
      }
  
      if (request.status !== 'PENDING') {
        throw new BadRequestException('Request has already been reviewed');
      }
  
      const updatedRequest = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.ownerRequest.update({
          where: { id: requestId },
          data: {
            status: dto.status,
            adminNote: dto.adminNote,
            reviewedBy: adminId,
            reviewedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
  
        if (dto.status === 'APPROVED') {
          await tx.user.update({
            where: { id: request.userId },
            data: { role: UserRole.OWNER },
          });
        }
  
        return updated;
      });
  
      return updatedRequest;
    }
  
    async cancelRequest(userId: string) {
      const request = await this.prisma.ownerRequest.findFirst({
        where: {
          userId,
          status: 'PENDING',
        },
      });
  
      if (!request) {
        throw new NotFoundException('No pending request found');
      }
  
      await this.prisma.ownerRequest.delete({
        where: { id: request.id },
      });
  
      return { message: 'Request cancelled successfully' };
    }
  }