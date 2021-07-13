import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'config/config-keys';
import { UserDto } from 'modules/user/dto/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(CONFIG.JWT_SECRET_KEY),
    });
  }

  /**
   * Callback used by passport before call all protected controller
   * and it returns a model with information signed in jwt
   * request.user object is populated with object return
   * @param payload
   */
  validate(payload: any): UserDto {
    return {
      id: payload.id,
      email: payload.email,
      nickname: payload.nickname,
      name: payload.name,
    };
  }
}
