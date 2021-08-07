import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from 'modules/user/repositories/user/user.repository';
import { CONFIG } from 'config/config-keys';
import { UserDocument } from 'modules/user/entities/user.entity';
import { CreateUserDto, UserDto } from 'modules/user/dtos/user.dto';
import { LoginDto } from 'modules/auth/dtos/login.dto';
import { MailerService } from '../../../../mailer/mailer.service';
import {
  ForgotPasswordDto,
  RecoveryPasswordDto,
} from 'modules/auth/dtos/recovery-password.dto';
import * as bcrypt from 'bcrypt';
import { AuthJwtService } from 'modules/auth/services/auth-jwt/auth-jwt.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private config: ConfigService,
    private userRepository: UserRepository,
    private authJwt: AuthJwtService,
    private mailerService: MailerService,
  ) {}

  /**
   * Register new user
   * @param user
   */
  async register(user: CreateUserDto): Promise<{ success: boolean }> {
    if (await this.userRepository.findByEmail(user.email)) {
      // Log error
      this.logger.error('User are registered: ' + user.email);

      // 400 Http response
      throw new BadRequestException('The given email is already registered');
    }

    const password = await bcrypt.hash(
      user.password,
      +this.config.get(CONFIG.BCRYPT_SALT_ROUNDS),
    );

    // const refreshSecret = await this.cypher.encrypt(uid(64));

    await this.userRepository.create({
      ...user,
      password,
    });

    // Log
    this.logger.log('User registered successfully: ' + user.email);

    return {
      success: true,
    };
  }

  /**
   * Called by controller after passport local strategy validation
   * @param user created in local strategy
   * @param onlyJwt
   */
  async generateJwt(user: UserDto, onlyJwt = false): Promise<LoginDto> {
    const response: LoginDto = {};

    // Generate access jwt
    response.accessToken = await this.authJwt.signAccess(user).catch((e) => {
      this.logger.log(e.message);
      throw new BadRequestException(e.message);
    });

    this.logger.log('Credentials generated successfully');

    // return accessToken
    if (onlyJwt) {
      return response;
    }

    // generate refresh jwt
    response.refreshToken = await this.authJwt.signRefresh(user).catch((e) => {
      this.logger.log(e.message);
      throw new BadRequestException(e.message);
    });

    // populate with user profile
    response.user = user;

    // Return Login response
    return response;
  }

  /**
   * Search user and send an email with a token to recovery account
   * @param user
   */
  async forgotPassword(user: ForgotPasswordDto) {
    if (!(await this.userRepository.findByEmail(user.email))) {
      this.logger.error('User not registered: ' + user.email);
      throw new NotFoundException('The given email is not registered');
    }

    const payload: RecoveryPasswordDto = {
      user: user.email,
    };

    const jwtDto = await this.authJwt.signRecovery(payload).catch((e) => {
      this.logger.log(e.message);
      throw new BadRequestException(e.message);
    });

    const mailerConfig = {
      to: user.email,
      from: 'test@test.com',
      subject: 'Recovery password request NEST CHAT ✔',
      text: 'http://localhost:4200/reset-password?token=' + jwtDto.token,
    };

    // Send recovery password mail
    await this.mailerService.sendMail(mailerConfig);

    this.logger.log('Recovery password mail was sent to ' + user.email);

    return {
      success: true,
    };
  }

  /**
   * Validate recovery token sent to user email
   * and save new password
   * @param data
   * @param password
   */
  async resetPassword(
    data: RecoveryPasswordDto,
    password: string,
  ): Promise<{ success: boolean }> {
    const user: UserDocument = await this.userRepository.findByEmail(data.user);

    if (!user) {
      this.logger.error('User not found: ' + user.email);
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(
      password,
      +this.config.get(CONFIG.BCRYPT_SALT_ROUNDS),
    );

    await user.save();

    this.logger.log('Password update successfully to user ' + user.email);

    return {
      success: true,
    };
  }
}
