import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserDto } from 'modules/user/dto/user.dto';

export class CreateChatDto {
  @IsNotEmpty()
  user: string;

  @IsNotEmpty()
  contact: string;
}

export class ChatDto {
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @ValidateNested()
  contact: UserDto;
}

export class CreateMessageDto {
  @IsMongoId()
  emitter: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsDate()
  createdAt?: Date;
}

export class MessageDto extends CreateMessageDto {
  @IsMongoId()
  id: string;
}

export class PrivateMessageDto {
  @IsMongoId()
  emitter: string;

  @IsMongoId()
  contact: string;

  @IsString()
  message: string;
}
