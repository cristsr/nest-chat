import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'modules/auth/auth.module';

@Module({
  imports: [AuthModule, JwtModule.register({})],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
