import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RecoveryPassword,
  RecoveryPasswordDocument,
} from 'modules/user/entities/recovery-password.entity';
import { RecoveryPasswordDto } from 'modules/auth/dto/recovery-password.dto';
import { UpdateUserDto } from 'modules/user/dto/user.dto';

@Injectable()
export class RecoveryPasswordRepository {
  constructor(
    @InjectModel(RecoveryPassword.name)
    private recoveryPasswordModel: Model<RecoveryPasswordDocument>,
  ) {}

  create(
    recoveryPassword: RecoveryPasswordDto,
  ): Promise<RecoveryPasswordDocument> {
    return this.recoveryPasswordModel.create(recoveryPassword);
  }

  findOne(recoveryToken): Promise<RecoveryPasswordDocument> {
    return this.recoveryPasswordModel
      .findOne({ recoveryToken })
      .then((record: RecoveryPasswordDocument) => {
        if (!record) throw new NotFoundException('Hash no encontrado');
        return record.populate({ path: 'user' }).execPopulate();
      });
  }

  update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<RecoveryPasswordDocument> {
    return this.recoveryPasswordModel
      .findByIdAndUpdate(id, updateUserDto)
      .exec();
  }

  remove(id: string): Promise<RecoveryPasswordDocument> {
    return this.recoveryPasswordModel.findByIdAndDelete(id).exec();
  }
}
