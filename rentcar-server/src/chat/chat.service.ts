import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/databases/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getMyChatRooms(userId: string) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          { userId1: userId },
          { userId2: userId },
          { booking: { userId: userId } },
          { booking: { car: { ownerId: userId } } },
        ],
      },
      include: {
        booking: {
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
            car: {
              include: {
                owner: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        user1: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return rooms;
  }

  async getOrCreateChatRoom(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          include: {
            owner: true,
          },
        },
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking && booking.userId !== userId && booking.car?.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    let chatRoom = await this.prisma.chatRoom.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            user: true,
            car: {
              include: {
                owner: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!chatRoom) {
      chatRoom = await this.prisma.chatRoom.create({
        data: {
          bookingId,
        },
        include: {
          booking: {
            include: {
              user: true,
              car: {
                include: {
                  owner: true,
                },
              },
            },
          },
          messages: true,
        },
      });
    }

    return chatRoom;
  }

  async getMessages(chatRoomId: string, userId: string) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        booking: {
          include: {
            car: true,
          },
        },
        user1: true,
        user2: true,
      },
    });

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    const hasAccess =
      chatRoom.userId1 === userId ||
      chatRoom.userId2 === userId ||
      (chatRoom.booking && 
        (chatRoom.booking.userId === userId || chatRoom.booking.car?.ownerId === userId));

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const messages = await this.prisma.message.findMany({
      where: { chatRoomId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  }

  async createMessage(userId: string, createMessageDto: CreateMessageDto) {
    const { chatRoomId, content } = createMessageDto;

    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        booking: {
          include: {
            car: true,
          },
        },
      },
    });

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    const hasAccess =
      chatRoom.userId1 === userId ||
      chatRoom.userId2 === userId ||
      (chatRoom.booking && 
        (chatRoom.booking.userId === userId || chatRoom.booking.car?.ownerId === userId));

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const message = await this.prisma.message.create({
      data: {
        chatRoomId,
        senderId: userId,
        content,
      },
      include: {
        sender: {
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

    await this.prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date() },
    });

    let recipientId: string | null = null;
    let senderName = `${message.sender.firstName} ${message.sender.lastName}`;
  
    if (chatRoom.bookingId && chatRoom.booking) {
      recipientId = chatRoom.booking.userId === userId 
        ? chatRoom.booking.car?.ownerId ?? null
        : chatRoom.booking.userId;
    } else {
      recipientId = chatRoom.userId1 === userId 
        ? chatRoom.userId2 
        : chatRoom.userId1;
    }
  
    if (recipientId) {
      await this.notificationsService.create({
        userId: recipientId,
        title: 'New message',
        message: `${senderName}: ${content.length > 50 ? content.substring(0, 50) + '...' : content}`,
        type: 'MESSAGE',
      });
    }
  

    return message;
  }

  async markAsRead(chatRoomId: string, userId: string) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        booking: {
          include: {
            car: true,
          },
        },
      },
    });

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    // Проверка доступа
    const hasAccess =
      chatRoom.userId1 === userId ||
      chatRoom.userId2 === userId ||
      (chatRoom.booking && 
        (chatRoom.booking.userId === userId || chatRoom.booking.car?.ownerId === userId));

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.message.updateMany({
      where: {
        chatRoomId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }

  async createDirectChatRoom(userId: string, recipientId: string) {
    if (userId === recipientId) {
      throw new BadRequestException('Cannot create chat room with yourself');
    }

    // Проверяем существующую комнату (используем правильные названия полей)
    const existingRoom = await this.prisma.chatRoom.findFirst({
      where: {
        OR: [
          { userId1: userId, userId2: recipientId },
          { userId1: recipientId, userId2: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
    });

    if (existingRoom) {
      return existingRoom;
    }

    // Создаем новую комнату (используем правильные названия полей)
    const newRoom = await this.prisma.chatRoom.create({
      data: {
        userId1: userId,
        userId2: recipientId,
      },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        messages: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return newRoom;
  }
}