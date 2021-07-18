import { Injectable } from '@nestjs/common';
import { BehaviorSubject, map } from 'rxjs';
import { Socket } from 'socket.io';
import { UserDto } from 'modules/user/dto/user.dto';

interface UserSocket {
  user: UserDto;
  client: Socket;
}

@Injectable()
export class ChatService {
  private readonly users$ = new BehaviorSubject<UserSocket[]>([]);

  get users() {
    return this.users$.asObservable();
  }

  get usersValue(): any[] {
    return this.users$.value;
  }

  connectUser(user: UserSocket) {
    const value = [...this.users$.value, user];
    this.users$.next(value);
  }

  disconnectUser(user: UserDto) {
    const value = this.users$.value.filter((v) => {
      if (v.user.id !== user.id) return true;
      if (v.client) v.client.disconnect();
      return false;
    });

    this.users$.next(value);
  }

  getUser(user: UserDto) {
    return this.users$.value.find((v) => v.user.id === user.id);
  }

  getConnectedUsers() {
    return this.users.pipe(map((users) => users.map((v) => v.user)));
  }
}
