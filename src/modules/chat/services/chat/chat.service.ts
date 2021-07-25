import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from 'modules/chat/repositories/chat.repository';
import { MessageRepository } from 'modules/chat/repositories/message-repository';
import {
  ChatDto,
  MessageDto,
  PrivateMessageDto,
} from 'modules/chat/dtos/createChatDto';
import { ChatDocument } from 'modules/chat/entities/chat.entity';
import { MessageDocument } from 'modules/chat/entities/message.entity';
import { doc } from 'prettier';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private chatRepository: ChatRepository,
    private messageRepository: MessageRepository,
  ) {}

  async privateMessage(data: PrivateMessageDto): Promise<void> {
    try {
      const message: MessageDocument = await this.messageRepository.create({
        emitter: data.emitter,
        message: data.message,
      });

      const userChat: ChatDocument = await this.chatRepository.findOrCreate({
        user: data.emitter,
        contact: data.contact,
      });

      const contactChat: ChatDocument = await this.chatRepository.findOrCreate({
        user: data.contact,
        contact: data.emitter,
      });

      userChat.messages.push(message.id);
      await userChat.save();

      contactChat.messages.push(message.id);
      await contactChat.save();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getChats(user: string): Promise<ChatDto[]> {
    const chats = await this.chatRepository.getChats(user);

    return chats.map(({ id, contact }) => ({
      id,
      contact: {
        id: contact.id,
        email: contact.email,
        name: contact.name,
        nickname: contact.nickname,
      },
    }));
  }

  async getMessagesFromChat(id: string): Promise<MessageDto[]> {
    this.logger.log('getMessagesFromChat execution');

    const chat = await this.chatRepository
      .getMessagesFromChat(id)
      .catch((e) => {
        throw new InternalServerErrorException(e.message);
      });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat.messages.map((document: MessageDocument) => ({
      id: document.id,
      emitter: document.emitter,
      message: document.message,
      createdAt: document.createdAt,
    }));
  }
}
