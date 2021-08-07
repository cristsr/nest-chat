import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Message } from 'modules/chat/entities/message.entity';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    type: [MongooseSchema.Types.ObjectId],
    ref: Message.name,
    default: [],
  })
  messages: any[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
