import { OmitType, PartialType } from '@nestjs/mapped-types';
import { UserDto } from 'modules/user/dto/user.dto';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto extends OmitType(UserDto, ['id']) {
  @IsString()
  password: string;

  @IsOptional()
  refreshSecret: string;
}
