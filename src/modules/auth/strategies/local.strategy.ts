import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from 'modules/user/repositories/user/user.repository';
import * as bcrypt from 'bcrypt';
import { UserDto } from 'modules/user/dto/user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('LocalStrategy');

  constructor(private userRepository: UserRepository) {
    super({ usernameField: 'email' });
  }

  /**
   * Callback used by passport to validate user credentials
   * @param email
   * @param password
   */
  async validate(email: string, password: string): Promise<UserDto> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.log('User not found: ' + email);

      // 404 Http response
      throw new NotFoundException('User not found');
    }

    // Validate password
    const passwordMatch = await bcrypt
      .compare(password, user.password)
      .catch((e: Error) => {
        this.logger.log('Bcrypt error: ' + e.message);

        // 503 Http response
        throw new ServiceUnavailableException(
          'At the moment we are having problems with the service',
        );
      });

    if (!passwordMatch) {
      this.logger.log('Invalid password for user: ' + email);

      // 401 Http response
      throw new UnauthorizedException('Incorrect password');
    }

    this.logger.log('User validate successfully: ' + user.email);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
    };
  }
}
