import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { map, Observable, pluck, scan, shareReplay, Subject } from 'rxjs';

interface Client {
  [key: string]: Socket;
}

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);

  private readonly dispatcher = new Subject();

  private server: Server;

  public readonly sockets: Observable<Client> = this.dispatcher.pipe(
    scan((state: Client, { action, payload }) => {
      // Connect socket
      if (action === 'CONNECT') {
        this.logger.log('Connect socket');

        const { id, client } = payload;

        // Remove user info from socket and disconnect
        if (state[id]) {
          this.logger.log('Remove current connection: ' + id);
          delete state[id].data.user;
          state[id].disconnect(true);
        }

        this.logger.log('Client connected: ' + id);

        return {
          ...state,
          [id]: client,
        };
      }

      // Disconnect socket
      if (action === 'DISCONNECT') {
        this.logger.log('Disconnect socket');
        const id = payload;

        // Remove user info from socket and disconnect
        if (state[id]) {
          this.logger.log('Remove user info: ' + id);
          delete state[id].data.user;
          state[id].disconnect(true);
        }

        delete state[id];

        this.logger.log('Socket disconnected: ' + id);

        return state;
      }

      //Send private message
      if (action === 'PRIVATE_MESSAGE') {
        const { to, from, message } = payload;

        state[to].send({
          event: 'private-message',
          data: {
            from,
            message,
          },
        });

        return state;
      }

      //Send public message
      if (action === 'PUBLIC_MESSAGE') {
        const { from, message } = payload;

        state[from].emit('public-message', {
          from,
          message,
        });

        return state;
      }

      return state;
    }, {}),
    shareReplay(1),
  );

  constructor() {
    this.sockets.pipe(map(Object.keys)).subscribe(console.log);
  }

  setServer(server: Server) {
    this.server = server;
  }

  initialize(): void {
    this.sockets.subscribe();
  }

  /**
   * If user already exist in connection repository then  disconnect current socket
   * and add new user
   */
  connect(id: string, client: Socket): void {
    this.dispatcher.next({
      action: 'CONNECT',
      payload: {
        id,
        client,
      },
    });
  }

  /**
   * Remove user from connection
   * @param id
   */
  disconnect(id: string): void {
    this.dispatcher.next({
      action: 'DISCONNECT',
      payload: id,
    });
  }

  /**
   * Return socket connected
   * @param id
   */
  getSocket(id: string): Observable<Socket | null> {
    return this.sockets.pipe(pluck(id));
  }

  sendPrivateMessage(to: string, from: string, message: string) {
    this.dispatcher.next({
      action: 'PRIVATE_MESSAGE',
      payload: {
        to,
        from,
        message,
      },
    });
  }
}
