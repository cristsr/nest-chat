import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from 'modules/chat/services/chat/chat.service';
import { CurrentUser } from 'modules/auth/decorators/current-user';
import { UserDto } from 'modules/user/dto/user.dto';
import { PrivateMessageDto } from 'modules/chat/dtos';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getChats(@CurrentUser() user: UserDto) {
    return this.chatService.getChats(user.id);
  }

  @Get(':chatId/messages')
  getMessagesFromChat(
    @CurrentUser() user: UserDto,
    @Param('chatId') id: string,
  ) {
    return this.chatService.getMessagesFromChat(id);
  }

  @Post('private-message')
  async sendPrivateMessage(@Body() data: PrivateMessageDto) {
    await this.chatService.savePrivateMessage(data);
  }
}
