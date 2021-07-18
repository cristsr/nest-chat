import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user/user.repository';
import { RecoveryPasswordRepository } from './repositories/recovery-password/recovery-password-repository';
import {
  RecoveryPassword,
  RecoveryPasswordSchema,
} from 'modules/user/entities/recovery-password.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RecoveryPassword.name, schema: RecoveryPasswordSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserRepository, RecoveryPasswordRepository],
  exports: [UserRepository, RecoveryPasswordRepository],
})
export class UserModule {}
