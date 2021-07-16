import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ChatService {
  private readonly users = new BehaviorSubject(null);
}
