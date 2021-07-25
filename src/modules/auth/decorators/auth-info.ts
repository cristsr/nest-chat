import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export const AuthInfo = createParamDecorator(
  (data: unknown, host: ExecutionContext) => {
    if (host.getType<any>() === 'ws') {
      const ctx = host.switchToWs();
      const client = ctx.getClient<Socket>();
      return client.data.user;
    }

    const ctx = host.switchToHttp();
    const client = ctx.getRequest();
    return client.authInfo;
  },
);
