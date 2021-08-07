import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MessageRepository } from 'modules/chat/repositories/message-repository';
import { RoomRepository } from 'modules/chat/repositories/room.repository';
import { MessageDto, PublicMessageDto, RoomDto } from 'modules/chat/dtos';
import { MessageDocument } from 'modules/chat/entities/message.entity';
import { RoomDocument } from 'modules/chat/entities/room.entity';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly roomRepository: RoomRepository,
  ) {}

  async savePublicMessage(data: PublicMessageDto): Promise<void> {
    const message: MessageDocument = await this.messageRepository.create({
      user: data.user,
      message: data.message,
    });

    const room: RoomDocument = await this.roomRepository.findOrCreate(
      data.room,
    );

    room.messages.push(message);
    await room.save();
  }

  /**
   * Return all messages from given room id
   * @param room
   */
  async getMessagesFrom(room: string): Promise<MessageDto[]> {
    this.logger.log('getMessagesFrom execution');

    const chat = await this.roomRepository.getMessagesFrom(room).catch((e) => {
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

  /**
   * Return all rooms created
   */
  async getRooms(): Promise<RoomDto[]> {
    const rooms = await this.roomRepository.getRooms();

    return rooms.map((room: RoomDocument) => ({
      id: room.id,
      name: room.name,
    }));
  }
}
