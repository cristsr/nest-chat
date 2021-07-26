import { Injectable } from '@nestjs/common';
import { Chat, ChatDocument } from 'modules/chat/entities/chat.entity';
import { Model } from 'mongoose';
import { CreateChatDto } from 'modules/chat/dtos';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
  ) {}

  /**
   * Find or create chat object in mongodb
   * with current user and contact given
   * @param user
   * @param contact
   */
  async findOrCreate(user: string, contact: string): Promise<ChatDocument> {
    const chat = await this.chatModel
      .findOne({
        user,
        contact,
      })
      .exec();

    // Chat found then return
    if (chat) {
      return chat;
    }

    // Create new chat
    return await this.chatModel.create({
      user,
      contact,
    });
  }

  /**
   * find or create chats for current user and contact
   * and return in an array of two positions
   * @param user
   * @param contact
   */
  async getChatsFrom(user: string, contact: string): Promise<ChatDocument[]> {
    // Chat current user
    const userChat: ChatDocument = await this.findOrCreate(user, contact);

    // Chat contact
    const contactChat: ChatDocument = await this.findOrCreate(contact, user);

    return [userChat, contactChat];
  }

  /**
   * Return all chats for the current user
   * @param user
   */
  getChats(user: string): Promise<ChatDocument[]> {
    return this.chatModel
      .find({ user })
      .select('contact')
      .populate({
        path: 'contact',
        select: 'name nickname email',
      })
      .exec();
  }

  /**
   * Return a chat by given id
   * @param chat
   */
  getChat(chat: string): Promise<ChatDocument> {
    return this.chatModel
      .findById(chat)
      .select('contact')
      .populate({
        path: 'contact',
        select: 'name nickname email',
      })
      .exec();
  }

  /**
   * Return messages from given chat
   * @param id
   */
  getMessagesFromChat(id: string): Promise<ChatDocument> {
    return this.chatModel
      .findById(id)
      .select('messages')
      .populate({
        path: 'messages',
        select: 'user message createdAt',
      })
      .exec();
  }
}
