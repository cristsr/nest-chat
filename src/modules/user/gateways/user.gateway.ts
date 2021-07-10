import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { Sockets } from '../providers/sockets';

@WebSocketGateway()
export class UserGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: any;

  constructor(private sockets: Sockets) {}

  /**
   * Remove a socket from pool when it is disconnected
   * @param clientRef
   */
  handleDisconnect(clientRef: any): any {
    this.sockets.disconnect(clientRef.id);
  }

  /**
   * Register new user to pool of sockets
   * @param userId
   * @param clientRef
   */
  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() clientRef) {
    this.sockets.register(userId, clientRef);
  }

  /**
   * Called when a new order is created
   * this method search a socket by userId and notifies the order created
   * @param payload
   * @param userId
   */
  @OnEvent('order.created', { async: true })
  handleOrderCreatedEvent(payload: any, userId: string) {
    try {
      this.sockets.getClient(userId).send(
        JSON.stringify({
          event: 'newOrder',
          data: payload,
        }),
      );
      Logger.log(
        `order ${payload._id} sent successfully to user ${userId}`,
        'UserGateway',
      );
    } catch (e) {
      Logger.log(e.message, 'UserGateway');
    }
  }
}
