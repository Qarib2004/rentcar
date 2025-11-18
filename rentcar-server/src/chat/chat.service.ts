import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../databases/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly websocketGateway: WebSocketGateway,
  ) {}

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

    if (booking.userId !== userId && booking.car.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this chat',
      );
    }

    let chatRoom = await this.prisma.chatRoom.findUnique({
      where: { bookingId },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!chatRoom) {
      chatRoom = await this.prisma.chatRoom.create({
        data: {
          bookingId,
        },
        include: {
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
    }

    return chatRoom;
  }

  async createMessage(userId: string, createMessageDto: CreateMessageDto) {
    const { chatRoomId, content } = createMessageDto;

    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
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
      },
    });

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    const booking = chatRoom.booking;
    if (booking.userId !== userId && booking.car.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to send messages in this chat',
      );
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
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    const recipientId =
      booking.userId === userId ? booking.car.ownerId : booking.userId;

    await this.kafkaProducer.sendChatMessage({
      messageId: message.id,
      chatRoomId,
      senderId: userId,
      recipientId,
      content,
    });

    this.websocketGateway.sendMessageToUser(recipientId, message);

    return message;
  }

  async getMessages(chatRoomId: string, userId: string) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
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
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    const booking = chatRoom.booking;
    if (booking.userId !== userId && booking.car.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this chat',
      );
    }

    return chatRoom.messages;
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

    const booking = chatRoom.booking;
    if (booking.userId !== userId && booking.car.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this chat',
      );
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

    return { message: 'Messages marked as read' };
  }

  async getMyChatRooms(userId: string) {
    const chatRooms = await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          {
            booking: {
              userId,
            },
          },
          {
            booking: {
              car: {
                ownerId: userId,
              },
            },
          },
        ],
      },
      include: {
        booking: {
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
              include: {
                owner: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
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
                senderId: { not: userId },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return chatRooms;
  }
}
