import { UserDto } from 'modules/user/dtos/user.dto';
import {
  IsDefined,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class JwtDto {
  @IsString()
  token: string;

  @IsString()
  tokenType?: string;

  @IsString()
  expiresIn?: number;
}

export class LoginDto {
  @IsDefined()
  @ValidateNested()
  accessToken?: JwtDto;

  @IsDefined()
  @ValidateNested()
  refreshToken?: JwtDto;

  @IsOptional()
  @ValidateNested()
  user?: UserDto;
}
