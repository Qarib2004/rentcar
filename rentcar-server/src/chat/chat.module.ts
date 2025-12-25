import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { WebSocketModule } from '../websocket/websocket.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [WebSocketModule,NotificationsModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
