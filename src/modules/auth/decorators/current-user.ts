import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, host: ExecutionContext) => {
    if (host.getType<any>() === 'ws') {
      const ctx = host.switchToWs();
      const client = ctx.getClient();
      return client.user;
    }

    const ctx = host.switchToHttp();
    const client = ctx.getRequest();
    return client.user;
  },
);
