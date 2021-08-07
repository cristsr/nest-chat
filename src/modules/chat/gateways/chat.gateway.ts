import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'modules/auth/guards/jwt.guard';
import { Socket, Server } from 'socket.io';
import { UserDto } from 'modules/user/dtos/user.dto';
import { AuthJwtService } from 'modules/auth/services/auth-jwt/auth-jwt.service';
import { SocketService } from 'modules/chat/services/socket/socket.service';

@UseGuards(JwtGuard)
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private authJwt: AuthJwtService,
    private socketService: SocketService,
  ) {}

  afterInit(): void {
    this.socketService.emitter.subscribe((data) => {
      this.server.emit('public-message', data);
    });
  }

  /**
   * Verify JWT and allow connections
   * @param socket
   */
  async handleConnection(socket: Socket): Promise<any> {
    try {
      // verify jwt
      const token = socket.handshake.headers.authorization?.split(' ')[1];
      const payload = await this.authJwt.verifyAccess<any>(token);

      // Populate socket with user
      socket.data.user = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        nickname: payload.nickname,
      } as UserDto;

      // Add socket ref to connections
      this.socketService.connect(payload.id, socket);

      // Get users and notify
      const users: UserDto[] = this.socketService.getConnectedUsers();
      this.server.emit('users', users);
      //
    } catch (e: any) {
      this.logger.error('WS connection error: ' + e.message);
      // Emmit exception
      socket.emit('exception', {
        status: 'error',
        message: e.message,
      });

      // disconnect socket
      socket.disconnect(true);
    }
  }

  /**
   * method is triggered after socket disconnect method was called
   * or after client disconnect
   * @param socket
   */
  handleDisconnect(socket: Socket): void {
    if (socket.data.user) {
      this.logger.log('handleDisconnect');
      const { id } = socket.data.user;

      // Remove client and disconnect
      this.socketService.disconnect(id);
    }
  }
}
