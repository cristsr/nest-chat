import { UserDto } from 'modules/user/dto/user.dto';
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

export class LoginResponseDto {
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
