import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat/chat.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'modules/auth/auth.module';
import { SocketService } from './services/socket/socket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'modules/chat/entities/chat.entity';
import { Message, MessageSchema } from 'modules/chat/entities/message.entity';
import { Room, RoomSchema } from 'modules/chat/entities/room.entity';
import { ChatRepository } from 'modules/chat/repositories/chat.repository';
import { MessageRepository } from 'modules/chat/repositories/message-repository';
import { ChatController } from './controllers/chat/chat.controller';
import { RoomRepository } from 'modules/chat/repositories/room.repository';
import { RoomService } from './services/room/room.service';
import { RoomController } from './controllers/room/room.controller';

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
      {
        name: Room.name,
        schema: RoomSchema,
      },
    ]),
    AuthModule,
    JwtModule.register({}),
  ],
  providers: [
    RoomRepository,
    ChatRepository,
    MessageRepository,
    ChatGateway,
    ChatService,
    SocketService,
    RoomService,
  ],
  controllers: [ChatController, RoomController],
})
export class ChatModule {}
