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
import { UserDto } from 'modules/user/dto/user.dto';
import { Socket } from 'socket.io';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Allow public endpoints continue with execution
   * and attach headers to socket in ws context.
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

    if (info) {
      // Handle HTTP errors
      if (context.getType<ContextType>() === 'http') {
        throw new UnauthorizedException(info.message);
      }

      // Handle WS errors
      if (context.getType<ContextType>() === 'ws') {
        throw new WsException(info.message);
      }
    }

    super.handleRequest(error, user, info, context);
  }
}
