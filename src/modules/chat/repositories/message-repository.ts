import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Message, MessageDocument } from 'modules/chat/entities/message.entity';
import { CreateMessageDto } from 'modules/chat/dtos';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  create(message: CreateMessageDto): Promise<MessageDocument> {
    return this.messageModel.create(message);
  }
}
