import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../common/decorators/cureent-user.decorator';
import { CreateChatRoomDto } from './dto/create-chat.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my chat rooms' })
  @ApiResponse({ status: 200, description: 'List of chat rooms' })
  async getMyChatRooms(@CurrentUser('id') userId: string) {
    return this.chatService.getMyChatRooms(userId);
  }

  @Get('rooms/:bookingId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get or create chat room for booking' })
  @ApiResponse({ status: 200, description: 'Chat room' })
  async getOrCreateChatRoom(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getOrCreateChatRoom(bookingId, userId);
  }

  @Get('rooms/:chatRoomId/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages in chat room' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  async getMessages(
    @Param('chatRoomId') chatRoomId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getMessages(chatRoomId, userId);
  }

  @Post('messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async createMessage(
    @CurrentUser('id') userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService.createMessage(userId, createMessageDto);
  }

  @Patch('rooms/:chatRoomId/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markAsRead(
    @Param('chatRoomId') chatRoomId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.markAsRead(chatRoomId, userId);
  }


  @Post('rooms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or get existing chat room with user' })
  @ApiResponse({ status: 201, description: 'Chat room created or retrieved' })
  async createChatRoom(
    @CurrentUser('id') userId: string,
    @Body() createChatRoomDto: CreateChatRoomDto,
  ) {
    return this.chatService.createDirectChatRoom(userId, createChatRoomDto.recipientId);
  }


}
