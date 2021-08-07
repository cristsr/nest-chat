import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserDto } from 'modules/user/dto/user.dto';

export class ChatDto {
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @ValidateNested()
  contact: UserDto;
}

export class CreateMessageDto {
  @IsMongoId()
  user: string;

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
  user: string;

  @IsMongoId()
  contact: string;

  @IsString()
  message: string;
}

export class PublicMessageDto {
  @IsMongoId()
  user: string;

  @IsMongoId()
  room: string;

  @IsString()
  message: string;
}

export class RoomDto {
  @IsMongoId()
  id: string;

  @IsString()
  name: string;
}
