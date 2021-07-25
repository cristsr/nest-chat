import { Injectable } from '@nestjs/common';
import { SocketService } from 'modules/chat/services/clients/socket.service';

@Injectable()
export class ConnectionService {
  constructor(private readonly clients: SocketService) {}
}
