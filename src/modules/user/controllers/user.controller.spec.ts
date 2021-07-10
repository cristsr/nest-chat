import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '@modules/user/controllers/user.controller';
import { UserService } from '@modules/user/services/user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@modules/user/entities/user.entity';
import {
  closeMongodConnection,
  rootMongooseTestModule,
} from '@database/mongodb-testing.config';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('/create', () => {
    jest.spyOn(userService, 'create').mockImplementation(() =>
      Promise.resolve({
        email: 'test',
        password: 'test',
        image: 'test',
        name: 'test',
      }),
    );

    expect(
      controller.create({
        email: 'test',
        password: 'test',
        name: 'test',
      }),
    ).toBeTruthy();
  });

  afterAll(async () => {
    await closeMongodConnection();
  });
});
