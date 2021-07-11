import { IsEmail, IsMongoId, IsString } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class UserDto {
  @IsMongoId()
  id: string;

  @IsString()
  name: string;

  @IsString()
  nickname: string;

  @IsEmail()
  email: string;
}

export class CreateUserDto extends OmitType(UserDto, ['id']) {
  @IsString()
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
