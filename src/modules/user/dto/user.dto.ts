import { IsEmail, IsMongoId, IsString } from 'class-validator';

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
