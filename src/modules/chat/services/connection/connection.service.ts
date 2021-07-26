import { Injectable } from '@nestjs/common';
import { SocketService } from 'modules/chat/services/socket/socket.service';

@Injectable()
export class ConnectionService {
  constructor(private readonly clients: SocketService) {}
}
