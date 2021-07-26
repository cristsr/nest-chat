import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    required: true,
    default: 'active',
  })
  status: 'active' | 'inactive';

  @Prop({
    required: true,
    default: new Date(),
  })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
