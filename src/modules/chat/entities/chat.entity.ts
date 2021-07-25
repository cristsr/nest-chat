import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'modules/user/entities/user.entity';
import { Message } from 'modules/chat/entities/message.entity';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
  })
  user: any;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
  })
  contact: any;

  @Prop({
    required: true,
    type: [MongooseSchema.Types.ObjectId],
    ref: Message.name,
    default: [],
  })
  messages: any[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
