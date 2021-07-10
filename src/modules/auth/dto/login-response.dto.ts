import { UserDto } from 'modules/user/dto/user.dto';
import { IsDefined, ValidateNested } from 'class-validator';

export class LoginResponseDto {
  @IsDefined()
  @ValidateNested()
  credentials: {
    accessToken: string;
    tokenType: string;
    expiresIn: string;
    refreshToken: string;
  };

  user: UserDto;
}
