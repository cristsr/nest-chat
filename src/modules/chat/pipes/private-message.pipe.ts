import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PrivateMessageDto } from 'modules/chat/dtos';
import { validateOrReject } from 'class-validator';

@Injectable()
export class PrivateMessagePipe implements PipeTransform {
  async transform(value: any): Promise<PrivateMessageDto> {
    console.log('pipe data', value);

    const privateMessage = new PrivateMessageDto();
    privateMessage.user = value.user.id;
    privateMessage.contact = value.body.contact;
    privateMessage.message = value.body.message;

    await validateOrReject(privateMessage, {
      validationError: { target: false },
    }).catch((e) => {
      throw new BadRequestException(e);
    });

    return privateMessage;
  }
}
