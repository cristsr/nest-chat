import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PrivateMessageDto } from 'modules/chat/dtos';

export const PrivateMessage = createParamDecorator(
  (data: unknown, host: ExecutionContext) => {
    const client = host.switchToHttp().getRequest();

    const { user, body, params } = client;

    return {
      user: user.id,
      message: body.message,
      contact: params.contact,
    } as PrivateMessageDto;
  },
);
