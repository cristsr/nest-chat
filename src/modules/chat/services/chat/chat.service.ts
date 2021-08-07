import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from 'modules/chat/repositories/chat.repository';
import { MessageRepository } from 'modules/chat/repositories/message-repository';
import { ChatDto, MessageDto, PrivateMessageDto } from 'modules/chat/dtos';
import { MessageDocument } from 'modules/chat/entities/message.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  /**
   * Save private message for current user and contact
   * @param data
   */
  async savePrivateMessage(data: PrivateMessageDto): Promise<void> {
    const message: MessageDocument = await this.messageRepository.create({
      user: data.user,
      message: data.message,
    });

    const [userChat, contactChat] = await this.chatRepository.getChatsFrom(
      data.user,
      data.contact,
    );

    userChat.messages.push(message.id);
    await userChat.save();

    contactChat.messages.push(message.id);
    await contactChat.save();
  }

  /**
   * Return all chats from current user
   * @param user
   */
  async getChats(user: string): Promise<ChatDto[]> {
    const chats = await this.chatRepository.getChats(user);

    console.log(chats);

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

  /**
   * Return all messages from given chat id
   * @param id
   */
  async getMessagesFrom(id: string): Promise<MessageDto[]> {
    this.logger.log('getMessagesFrom execution');

    const chat = await this.chatRepository
      .getMessagesFromChat(id)
      .catch((e) => {
        throw new InternalServerErrorException(e.message);
      });

    if (!chat) {
      throw new NotFoundException('Room not found');
    }

    return chat.messages.map((document: MessageDocument) => ({
      id: document.id,
      user: document.user,
      message: document.message,
      createdAt: document.createdAt,
    }));
  }
}
