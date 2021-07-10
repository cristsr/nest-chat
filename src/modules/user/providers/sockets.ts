import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class Sockets {
  private users = {};

  /**
   * Set id to the client and add it to pool of sockets
   * @param userId
   * @param client
   */
  register(userId: string, client: any): void {
    client.id = userId;
    this.users[userId] = client;

    Logger.log(`User ${userId} was connected`, 'Sockets');
    this.logClients();
  }

  /**
   * Retrieves a client by userId
   * @param userId
   */
  getClient(userId: string): any {
    if (!this.users[userId]) {
      throw new WsException(`User ${userId} not found`);
    }

    return this.users[userId];
  }

  /**
   * Remove a client by userId
   * @param userId
   */
  disconnect(userId): void {
    delete this.users[userId];
    Logger.log(`User ${userId} was disconnect`, 'Sockets');
    this.logClients();
  }

  /**
   * Print all clients connected
   */
  logClients() {
    const clients = Object.keys(this.users);

    if (!clients.length) {
      Logger.log('Not users connected', 'Sockets');
      return;
    }

    Logger.log('Sockets connected', 'Socket');
    console.table(clients);
  }
}
