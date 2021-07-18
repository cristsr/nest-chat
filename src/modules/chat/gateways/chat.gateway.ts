import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from 'modules/chat/services/chat.service';
import { map, Observable, tap } from 'rxjs';
import { JwtGuard } from 'modules/auth/guards/jwt.guard';
import { Socket, Server } from 'socket.io';
import { UserDto } from 'modules/user/dto/user.dto';
import { AuthJwtService } from 'modules/auth/services/auth-jwt/auth-jwt.service';

@UseGuards(JwtGuard)
@WebSocketGateway({ namespace: '/users' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private authJwt: AuthJwtService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const { authorization } = client.handshake.headers;

    const user = await this.authJwt
      .verifyAccess<UserDto>(authorization, true)
      .catch((e) => {
        this.logger.error('WS connection error: ' + e.message);

        // Emmit exception and disconnect
        client.emit('exception', {
          status: 'error',
          message: e.message,
        });

        client.disconnect();

        return null;
      });

    if (!user) return;

    if (this.chatService.getUser(user)) {
      await this.server.allSockets();

      this.logger.warn('Disconnect duplicated socket ' + user.email);
      // client.disconnect(true);
      // return;
    }

    this.logger.log('User connected ' + user.email);

    // Connect user
    this.chatService.connectUser({
      user,
      client,
    });

    // Populate user information in client
    client.data.user = user;

    this.server.emit(
      'list',
      this.chatService.usersValue.map((v) => v.user),
    );

    // this.logger.log();
  }

  handleDisconnect(client: Socket): any {
    if (!client.data.user) return;

    this.logger.log('User disconnected ' + client.data.user.email);

    // Disconnect user
    this.chatService.disconnectUser(client.data.user);

    return;
  }

  @SubscribeMessage('list')
  handleList(): Observable<WsResponse> {
    return this.chatService.getConnectedUsers().pipe(
      tap((v) => this.logger.log('Total users connected: ' + v.length)),
      map((v) => ({
        event: 'list',
        data: v,
      })),
    );
  }
}
