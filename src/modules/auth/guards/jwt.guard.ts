import {
  ContextType,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'modules/auth/decorators/public';
import { Observable } from 'rxjs';
import { WsException } from '@nestjs/websockets';
import { UserDto } from 'modules/user/dtos/user.dto';
import { Socket } from 'socket.io';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Allow public endpoints continue with execution
   * and attach headers to client in ws context.
   * @param context
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.log('Context ' + context.getType());

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Public resources for all context
    if (isPublic) {
      this.logger.log('Public route called');
      return true;
    }

    this.logger.log('Private route called');

    // Websocket context validations
    if (context.getType<ContextType>() === 'ws') {
      const host = context.switchToWs();
      const client = host.getClient<Socket>();
      client['headers'] = client.handshake.headers;
    }

    return super.canActivate(context);
  }

  /**
   * Handle WS and Http Exceptions from Jwt.
   * @param error
   * @param user
   * @param info
   * @param context
   */
  handleRequest(
    error: any,
    user: UserDto | false,
    info: Error,
    context: ExecutionContext,
  ): any {
    if (user) return user;

    this.logger.error('handleRequest: ' + info.message);

    // Handle HTTP errors
    if (context.getType<ContextType>() === 'http') {
      throw new UnauthorizedException(info.message);
    }

    // Handle WS errors
    if (context.getType<ContextType>() === 'ws') {
      const client = context.switchToWs().getClient<Socket>();

      // send exception
      client.emit('exception', {
        status: 'error',
        message: info.message,
      });

      // disconnect client
      client.disconnect(true);

      // hack to blocking execution
      throw new WsException('');
    }
  }
}
