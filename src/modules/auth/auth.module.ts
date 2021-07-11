import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from 'modules/auth/controllers/auth.controller';
import { AuthService } from 'modules/auth/services/auth.service';
import { LocalStrategy } from 'modules/auth/strategies/local.strategy';
import { JwtStrategy } from 'modules/auth/strategies/jwt.strategy';
import { UserModule } from 'modules/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { RestJwtAuthGuard } from 'modules/auth/guards/rest-jwt-auth.guard';
import { MailerModule } from '../../mailer/mailer.module';
import { CypherModule } from 'utils/cypher/cypher.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UserModule,
    MailerModule,
    CypherModule.register({
      algorithm: 'aes-256-ctr',
      keylen: 32,
      iv: '3656e6060f1fa937',
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      // by default each controller uses this guard
      provide: APP_GUARD,
      useClass: RestJwtAuthGuard,
    },
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
