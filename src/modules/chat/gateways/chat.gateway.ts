import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from 'modules/chat/services/chat.service';
import { interval, map } from 'rxjs';
import { JwtGuard } from 'modules/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@WebSocketGateway()
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('users/list')
  handleMessage() {
    this.logger.log('new message');

    return interval(5000).pipe(
      map((v) => ({ event: 'users/list', data: 'hello' })),
    );
  }

  @SubscribeMessage('connection')
  connection() {
    this.logger.log('on connection');
  }
}
