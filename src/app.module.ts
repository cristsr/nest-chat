import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONFIG } from 'config/config-keys';
import { MailerModule } from './mailer/mailer.module';
import { MiddlewareModule } from './core/middleware/middlewareModule';
import { AuthModule } from 'modules/auth/auth.module';
import { UserModule } from 'modules/user/user.module';
import { ChatModule } from 'modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UserModule,
    MailerModule,
    MiddlewareModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  // app port
  static port: number;

  constructor(private config: ConfigService) {
    AppModule.port = +config.get(CONFIG.PORT) || 3000;
  }
}
