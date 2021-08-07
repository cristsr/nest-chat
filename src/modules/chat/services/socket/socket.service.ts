import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrivateMessageDto, PublicMessageDto } from 'modules/chat/dtos';
import { UserDto } from 'modules/user/dto/user.dto';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);

  private readonly sockets: { [key: string]: Socket } = {};

  private readonly emitter$ = new Subject();

  get emitter(): Observable<any> {
    return this.emitter$.asObservable();
  }

  /**
   * If user already exist in connection repository then  disconnect current socket
   * and CONNECT new user
   */
  connect(id: string, socket: Socket): void {
    // Remove user info from socket and disconnect
    if (this.sockets[id]) {
      delete this.sockets[id].data.user;
      this.sockets[id].disconnect(true);
    }

    // add new socket
    this.sockets[id] = socket;

    this.logger.log('Socket was connected: ' + id);
  }

  /**
   * Remove user from connection
   * @param id
   */
  disconnect(id: string): void {
    if (this.sockets[id]) {
      // Remove user info
      delete this.sockets[id].data.user;
      // Disconnect socket
      this.sockets[id].disconnect(true);
    }
    // Remove socket from object
    delete this.sockets[id];

    this.logger.log('Socket was disconnected: ' + id);
  }

  sendPrivateMessage(data: PrivateMessageDto) {
    const socket = this.sockets[data.contact];

    if (!socket) {
      this.logger.log('Socket not found');
      return;
    }

    // emmit event
    socket.emit('private-message', {
      user: data.user,
      message: data.message,
    });

    this.logger.log('Private message was sent');
  }

  sendPublicMessage(data: PublicMessageDto) {
    this.emitter$.next(data);
  }

  getConnectedUsers(): UserDto[] {
    const sockets: Socket[] = Object.values(this.sockets);
    return sockets.map((v: Socket) => v.data.user);
  }
}
