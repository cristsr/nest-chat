import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat/chat.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'modules/auth/auth.module';
import { ConnectionService } from './services/connection/connection.service';
import { SocketService } from './services/socket/socket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'modules/chat/entities/chat.entity';
import { Message, MessageSchema } from 'modules/chat/entities/message.entity';
import { ChatRepository } from 'modules/chat/repositories/chat.repository';
import { MessageRepository } from 'modules/chat/repositories/message-repository';
import { ChatController } from './controllers/chat.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Chat.name,
        schema: ChatSchema,
      },
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
    AuthModule,
    JwtModule.register({}),
  ],
  providers: [
    ChatRepository,
    MessageRepository,
    ChatGateway,
    ChatService,
    ConnectionService,
    SocketService,
  ],
  controllers: [ChatController],
})
export class ChatModule {}
