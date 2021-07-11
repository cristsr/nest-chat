import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from 'modules/auth/services/auth.service';

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
  async validate(email: string, password: string): Promise<any> {
    return await this.authService.validateUser(email, password);
  }
}
