import { Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from 'modules/auth/decorators/current-user';
import { UserDto } from 'modules/user/dto/user.dto';
import { PublicMessage } from 'modules/chat/decorators/public-message';
import { PublicMessageDto } from 'modules/chat/dtos';
import { RoomService } from 'modules/chat/services/room/room.service';
import { SocketService } from 'modules/chat/services/socket/socket.service';

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly socketService: SocketService,
  ) {}

  @Get()
  getRooms() {
    return this.roomService.getRooms();
  }

  @Get(':room/messages')
  getMessagesFromRoom(
    @CurrentUser() user: UserDto,
    @Param('room') room: string,
  ) {
    return this.roomService.getMessagesFrom(room);
  }

  @Post(':room/message')
  async sendPublicMessage(
    @PublicMessage()
    data: PublicMessageDto,
  ) {
    await this.roomService.savePublicMessage(data);
    this.socketService.sendPublicMessage(data);
  }
}
