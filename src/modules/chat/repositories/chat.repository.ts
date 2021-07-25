import { Inject, Injectable } from '@nestjs/common';
import { Chat, ChatDocument } from 'modules/chat/entities/chat.entity';
import { Model, Query, QueryCursor } from 'mongoose';
import { CreateChatDto } from 'modules/chat/dtos/createChatDto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
  ) {}

  async findOrCreate(data: CreateChatDto): Promise<ChatDocument> {
    const chat = await this.chatModel
      .findOne({
        user: data.user as string,
        contact: data.contact as string,
      })
      .exec();

    if (chat) {
      return chat;
    }

    // Create new chat
    return await this.chatModel.create({
      user: data.user as string,
      contact: data.contact as string,
    });
  }

  getChats(user): Promise<ChatDocument[]> {
    return this.chatModel
      .find({ user })
      .select('contact')
      .populate({
        path: 'contact',
        select: 'name nickname email',
      })
      .exec();
  }

  getChat(chat: string) {
    return this.chatModel
      .find({
        _id: chat,
      })
      .select('contact')
      .populate({
        path: 'contact',
        select: 'name nickname email',
      });
  }

  getMessagesFromChat(id: string) {
    return this.chatModel
      .findById({
        _id: id,
      })
      .select('messages')
      .populate({
        path: 'messages',
        select: 'emitter message createdAt',
      });
  }
}
