import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from 'modules/chat/entities/room.entity';

@Injectable()
export class RoomRepository {
  constructor(
    @InjectModel(Room.name)
    private roomModel: Model<RoomDocument>,
  ) {}

  getRooms(): Promise<RoomDocument[]> {
    return this.roomModel.find().select('id name').exec();
  }

  /**
   * Find or create room object in mongodb
   * with current id given
   * @param id
   */
  async findOrCreate(id: string): Promise<RoomDocument> {
    const room = await this.roomModel.findById(id).exec();

    // Room found then return
    if (room) {
      return room;
    }

    // Create new chat
    return await this.roomModel.create({ name: 'public' });
  }

  /**
   * Return messages from given chat
   * @param room
   */
  getMessagesFrom(room: string): Promise<RoomDocument> {
    return this.roomModel
      .findById(room)
      .select('messages')
      .populate({
        path: 'messages',
        select: 'user message createdAt',
      })
      .exec();
  }
}
