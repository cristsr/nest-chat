import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'modules/user/repositories/user/user.repository';
import { CONFIG } from 'config/config-keys';
import { JwtResponseDto } from 'modules/auth/dto/jwt-response.dto';
import { UserDocument } from 'modules/user/entities/user.entity';
import { RecoveryPasswordRepository } from 'modules/user/repositories/recovery-password/recovery-password-repository';
import { CreateUserDto, UserDto } from 'modules/user/dto/user.dto';
import { LoginResponseDto } from 'modules/auth/dto/login-response.dto';
import { MailerService } from '../../../mailer/mailer.service';
import {
  ForgotPasswordDto,
  RecoveryPasswordDto,
} from 'modules/user/dto/recovery-password.dto';
import { CypherService } from 'utils/cypher/cypher.service';
import { getMethodName } from 'utils/functions';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private config: ConfigService,
    private userService: UserRepository,
    private recoveryPasswordService: RecoveryPasswordRepository,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private cypher: CypherService,
  ) {}

  /**
   * Register new user
   * @param user
   */
  async register(user: CreateUserDto): Promise<{ success: boolean }> {
    this.logger.log('Start method execution: ' + getMethodName());

    if (await this.userService.findByEmail(user.email)) {
      // Log error
      this.logger.log('User are registered: ' + user.email);

      // 400 Http response
      throw new BadRequestException('The given email is already registered');
    }

    const password = await bcrypt.hash(
      user.password,
      +this.config.get(CONFIG.BCRYPT_SALT_ROUNDS),
    );

    // const refreshSecret = await this.cypher.encrypt(uid(64));

    await this.userService.create({
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
   * @param user model created in jwt strategy
   * @param onlyJwt
   */
  generateJwt(user: UserDto, onlyJwt = false): LoginResponseDto {
    this.logger.log('Start method execution: ' + getMethodName());

    const accessToken = this.jwtService.sign(user, {
      secret: this.config.get(CONFIG.JWT_SECRET_KEY),
      expiresIn: this.config.get(CONFIG.JWT_EXPIRATION_TIME),
    });

    const expiresIn = +this.config.get(CONFIG.JWT_EXPIRATION_TIME).slice(0, -1);

    if (onlyJwt) {
      return {
        credentials: {
          accessToken,
          tokenType: 'Bearer',
          expiresIn,
        },
      };
    }

    const refreshToken = this.jwtService.sign(user, {
      secret: this.config.get(CONFIG.REFRESH_SECRET_KEY),
    });

    this.logger.log('Credentials generated successfully');

    return {
      credentials: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn,
        refreshToken,
      },
      user,
    };
  }

  /**
   * Search user by email and send a email with a token to recovery account
   * @param user
   */
  async forgotPassword(user: ForgotPasswordDto) {
    this.logger.log('Start method execution: ' + getMethodName());

    if (!(await this.userService.findByEmail(user.email))) {
      this.logger.log('User not registered: ' + user.email);

      throw new NotFoundException('The given email is not registered');
    }

    const recoveryExpSeconds = +this.config
      .get(CONFIG.RECOVERY_EXPIRATION_TIME)
      .slice(0, -1);

    const issuedAt = new Date().getTime();

    const expTime = new Date(issuedAt + recoveryExpSeconds * 1000).getTime();

    const payload: RecoveryPasswordDto = {
      user: user.email,
      expTime,
      issuedAt,
    };

    const token = await this.cypher.encrypt(
      JSON.stringify(payload),
      this.config.get(CONFIG.RECOVERY_SECRET_KEY),
    );

    this.logger.log('Recovery token generated successfully ' + user.email);

    const mailerConfig = {
      to: user.email,
      from: 'test@applacarta.com',
      subject: 'Recovery password request NEST CHAT ✔',
      text: 'http://localhost:4200/reset-password?token=' + token,
    };

    // Send recovery password mail
    await this.mailerService.sendMail(mailerConfig);

    this.logger.log('Recovery password mail was sent: ' + user.email);

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
    this.logger.log('Start resetPassword method execution');

    const user: UserDocument = await this.userService.findByEmail(data.user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(
      password,
      +this.config.get(CONFIG.BCRYPT_SALT_ROUNDS),
    );

    await user.save();

    return {
      success: true,
    };
  }

  /**
   * Refresh token
   * @param user
   */
  async refresh(user: any) {
    this.logger.log('Start method execution: ' + getMethodName());

    const payload = {
      id: user.id,
      username: user.name,
      email: user.email,
    };

    const jwtResponse: JwtResponseDto = {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: +this.config.get(CONFIG.JWT_EXPIRATION_TIME).slice(0, 1),
    };

    return jwtResponse;
  }
}
