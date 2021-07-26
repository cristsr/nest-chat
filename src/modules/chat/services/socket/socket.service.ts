import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { map, Observable } from 'rxjs';
import { Store } from 'modules/chat/store/store.service';
import { initialState, State } from 'modules/chat/store/state';
import { reducer } from 'modules/chat/store/reducers';
import { Actions } from 'modules/chat/store/actions';
import { select } from 'modules/chat/store/operators';
import { PrivateMessageDto } from 'modules/chat/dtos';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);

  private readonly socketStore = new Store<State>(reducer, initialState);

  constructor() {
    this.socketStore.subscribe((state) =>
      console.log('Sockets connected', Object.keys(state.sockets)),
    );
  }

  setServer(server: Server) {
    this.socketStore.next({
      type: Actions.SET_SERVER,
      payload: server,
    });
  }

  /**
   * If user already exist in connection repository then  disconnect current socket
   * and CONNECT new user
   */
  connect(id: string, client: Socket): void {
    this.logger.log('connect called');
    this.socketStore.next({
      type: Actions.CONNECT,
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
    this.socketStore.next({
      type: Actions.DISCONNECT,
      payload: id,
    });
  }

  /**
   * Return socket connected
   * @param id
   */
  getSocket(id: string): Observable<Socket> {
    return this.socketStore.pipe(
      select('socket'),
      map((v) => v[id]),
    );
  }

  sendPrivateMessage(data: PrivateMessageDto) {
    this.socketStore.next({
      type: Actions.PRIVATE_MESSAGE,
      payload: data,
    });
  }

  sendPublicMessage(from: string, message: string) {
    this.socketStore.next({
      type: Actions.PUBLIC_MESSAGE,
      payload: {
        from,
        message,
      },
    });
  }
}
