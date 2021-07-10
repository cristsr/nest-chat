import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { User } from 'modules/user/entities/user.entity';

export type RecoveryPasswordDocument = RecoveryPassword & Document;

@Schema()
export class RecoveryPassword {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
  })
  user: User | ObjectId;

  @Prop()
  dueDate: string;

  @Prop({ select: false })
  recoveryToken: string;

  @Prop({ default: false })
  isCompleted: boolean;
}

export const RecoveryPasswordSchema =
  SchemaFactory.createForClass(RecoveryPassword);
