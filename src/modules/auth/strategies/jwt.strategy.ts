import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'config/config-keys';
import { UserDto } from 'modules/user/dto/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(CONFIG.JWT_SECRET_KEY),
    });
  }

  /**
   * Callback used by passport before call all protected controller
   * and it returns a model with information signed in jwt.
   * @param payload
   * @return UserDto request.user is populated with object return
   */
  validate(payload: any): UserDto {
    this.logger.log('JWT validation successfully');

    return {
      id: payload.id,
      email: payload.email,
      nickname: payload.nickname,
      name: payload.name,
    };
  }
}
