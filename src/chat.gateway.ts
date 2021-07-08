import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { of } from 'rxjs';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  private logger = new Logger('ChatGateway');

  handleConnection(client: Socket): void {
    this.logger.log(
      'Client connected ' + JSON.stringify(client.handshake.address),
    );
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): any {
    this.logger.log('Incoming message', payload);
    // return of(payload);
    // client.emit('message', { data: payload });

    return of({
      event: 'message',
      data: {
        receiver: payload,
      },
    });
  }
}
