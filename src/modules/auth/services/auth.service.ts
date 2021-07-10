import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
// import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'modules/user/repositories/user/user.repository';
import { CreateUserDto } from 'modules/user/dto/create-user.dto';
import { CONFIG } from 'config/config-keys';
import { JwtResponseDto } from 'modules/auth/dto/jwt-response.dto';
import { randomBytes } from 'crypto';
import { ForgotPasswordDto } from 'modules/user/dto/forgot-password.dto';
import { UserDocument } from 'modules/user/entities/user.entity';
import { RecoveryPasswordRepository } from 'modules/user/repositories/recovery-password/recovery-password-repository';
import { RecoveryPasswordDocument } from 'modules/user/entities/recovery-password.entity';
import * as bcrypt from 'bcrypt';
import { UserDto } from 'modules/user/dto/user.dto';
import { LoginResponseDto } from 'modules/auth/dto/login-response.dto';
import { MailerService } from '../../../mailer/mailer.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private config: ConfigService,
    private userService: UserRepository,
    private recoveryPasswordService: RecoveryPasswordRepository,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  /**
   * validate if user exist and given password is correct
   * called by passport local strategy
   * @param email
   * @param pass
   */
  async validateUser(email: string, pass: string): Promise<UserDto> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      this.logger.log('User not found: ' + email);

      // 404 Http response
      throw new NotFoundException('User not found');
    }

    // Validate password
    const isMatch = await bcrypt.compare(pass, user.password).catch((e) => {
      this.logger.log('Bcrypt error: ' + e.message());

      // 503 Http response
      throw new ServiceUnavailableException(
        'At the moment we are having problems with the service',
      );
    });

    if (!isMatch) {
      this.logger.log('Invalid password for user: ' + email);

      // 401 Http response
      throw new UnauthorizedException('Incorrect password');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
    };
  }

  /**
   * create jwt after user validation
   * @param user model created in jwt strategy
   */
  generateJwt(user: UserDto): LoginResponseDto {
    const credentials = {
      accessToken: this.jwtService.sign(user),
      tokenType: 'Bearer',
      expiresIn: this.config.get(CONFIG.JWT_EXPIRATION_TIME).slice(0, -1),
      refreshToken: this.jwtService.sign(user, {
        secret: this.config.get(CONFIG.JWT_SECRET_KEY),
      }),
    };

    return {
      credentials,
      user,
    };
  }

  /**
   * Register new user
   * @param user
   */
  async register(user: CreateUserDto): Promise<{ success: boolean }> {
    if (await this.userService.findByEmail(user.email)) {
      // Log error
      this.logger.log('User are registered: ' + user.email);

      // 400 Http response
      throw new BadRequestException('The given email is already registered');
    }

    user.password = await bcrypt.hash(
      user.password,
      +this.config.get(CONFIG.BCRYPT_SALT_OR_ROUNDS),
    );

    await this.userService.create(user);

    // Log
    this.logger.log('User registered successfully ' + user.email);

    return {
      success: true,
    };
  }

  /**
   * Search user by email and send a email with a token to recovery account
   * @param user
   */
  async forgotPassword(user: ForgotPasswordDto) {
    this.logger.log('Call forgotPassword method');

    const record: UserDocument | null = await this.userService.findByEmail(
      user.email,
    );

    if (!record) {
      this.logger.log('User not registered: ' + user.email);

      throw new BadRequestException('The given email is not registered');
    }

    // User is registered
    const minute = 60000;
    const currentDate = new Date().getTime();
    const dueDate = new Date(currentDate + minute).toISOString();
    const recoveryToken = randomBytes(32).toString('hex');

    await this.recoveryPasswordService.create({
      user: record._id,
      dueDate,
      recoveryToken,
    });

    const mailerConfig = {
      to: user.email,
      from: 'test@applacarta.com',
      subject: 'Recovery password request NEST CHAT ✔',
      text: 'lorem*10',
    };

    await this.mailerService.sendMail(mailerConfig);

    // try {
    //   await this.mailerService.sendMail({
    //     to: user.email,
    //     from: 'test@applacarta.com',
    //     subject:
    //       'Solicitud de recuperacion de contraseña para su cuenta de applacarta ✔',
    //     html: passwordRecovery({
    //       email: user.email,
    //       recoveryToken,
    //     }),
    //   });
    // } catch (e) {
    //   Logger.error(e.message, '', 'Send Mail Error');
    //   throw new InternalServerErrorException(
    //     'No se pudo enviar el correo al usuario registrado',
    //   );
    // }

    return {
      success: true,
    };
  }

  /**
   * Search a recovery account record by token given previously via email
   * and set the new password to user;
   * @param recoveryToken
   * @param password
   */
  async changePassword(recoveryToken: string, password: string) {
    const record: RecoveryPasswordDocument | null =
      await this.recoveryPasswordService.findOne(recoveryToken);

    if (!record) {
      throw new BadRequestException('Token de recuperacion invalido o nulo');
    }

    // return record;
    const currentDate = new Date();
    const dueDate = new Date(record.dueDate);

    if (currentDate > dueDate) {
      throw new UnprocessableEntityException(
        'El token de recuperacion ha caducado',
      );
    }

    const user = record.user as UserDocument;

    user.password = await bcrypt.hash(
      password,
      +this.config.get(CONFIG.BCRYPT_SALT_OR_ROUNDS),
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
    const payload = {
      _id: user._id,
      username: user.name,
      email: user.email,
    };

    const jwtResponse: JwtResponseDto = {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: this.config.get(CONFIG.JWT_EXPIRATION_TIME),
    };

    return jwtResponse;
  }
}
