import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PublicMessageDto } from 'modules/chat/dtos';

export const PublicMessage = createParamDecorator(
  (data: unknown, host: ExecutionContext) => {
    const client = host.switchToHttp().getRequest();

    const { user, body, params } = client;

    return {
      user: user.id,
      message: body.message,
      room: params.room,
    } as PublicMessageDto;
  },
);
