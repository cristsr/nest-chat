import { Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from 'modules/chat/services/chat/chat.service';
import { CurrentUser } from 'modules/auth/decorators/current-user';
import { UserDto } from 'modules/user/dto/user.dto';
import { PrivateMessageDto } from 'modules/chat/dtos';
import { SocketService } from 'modules/chat/services/socket/socket.service';
import { PrivateMessage } from 'modules/chat/decorators/private-message';
import { RoomService } from 'modules/chat/services/room/room.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
    private readonly socketService: SocketService,
  ) {}

  @Get()
  getChats(@CurrentUser() user: UserDto) {
    return this.chatService.getChats(user.id);
  }

  @Get(':chat/messages')
  getMessagesFromChat(
    @CurrentUser() user: UserDto,
    @Param('chat') chat: string,
  ) {
    return this.chatService.getMessagesFrom(chat);
  }

  @Post(':contact/message')
  async sendPrivateMessage(
    @PrivateMessage()
    data: PrivateMessageDto,
  ) {
    await this.chatService.savePrivateMessage(data);
    this.socketService.sendPrivateMessage(data);
  }
}
