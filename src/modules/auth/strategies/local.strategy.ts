import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuthService } from 'modules/auth/services/auth.service';
import { UserDto } from 'modules/user/dto/user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('LocalStrategy');

  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  /**
   * Callback used by passport to validate if user exist
   * @param email
   * @param password
   */
  async validate(email: string, password: string): Promise<UserDto> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      // Log error
      this.logger.log('User not found: ' + email);

      // 404 http response
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
