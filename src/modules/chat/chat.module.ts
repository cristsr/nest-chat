import { Module } from '@nestjs/common';
import { GatewaysGateway } from './gateways.gateway';
import { ChatGateway } from './gateways/chat.gateway';

@Module({
  providers: [GatewaysGateway, ChatGateway]
})
export class ChatModule {}
