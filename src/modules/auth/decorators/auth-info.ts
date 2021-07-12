import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthInfo = createParamDecorator(
  (data: unknown, host: ExecutionContext) => {
    if (host.getType<any>() === 'ws') {
      const ctx = host.switchToWs();
      const client = ctx.getClient();
      return client.authInfo;
    }

    const ctx = host.switchToHttp();
    const client = ctx.getRequest();
    return client.authInfo;
  },
);
