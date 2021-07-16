import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from 'modules/auth/controllers/auth.controller';
import { AuthService } from 'modules/auth/services/auth.service';
import { LocalStrategy } from 'modules/auth/strategies/local.strategy';
import { JwtStrategy } from 'modules/auth/strategies/jwt.strategy';
import { UserModule } from 'modules/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './guards/jwt.guard';
import { MailerModule } from '../../mailer/mailer.module';
import { RefreshJwtGuard } from 'modules/auth/guards/refresh-jwt.guard';
import { ResetPasswordGuard } from 'modules/auth/guards/reset-password.guard';

@Module({
  imports: [PassportModule, JwtModule.register({}), UserModule, MailerModule],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtGuard,
    ResetPasswordGuard,
    {
      // by default each controller uses this guard
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
