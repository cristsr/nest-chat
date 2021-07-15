import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from 'modules/auth/services/auth/auth.service';
import { User, UserSchema } from 'modules/user/entities/user.entity';
import { UserModule } from 'modules/user/user.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        ConfigModule,
        JwtModule.register({}),
        UserModule,
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST /register 200 success', async () => {
    jest
      .spyOn(authService, 'register')
      .mockImplementation(() => Promise.resolve({ success: true }));

    const result = await controller.register({
      email: 'test',
      password: 'test',
      name: 'test',
      nickname: 'test',
    });

    expect(result).toMatchObject({ success: true });
  });

  it('POST /register 400 bad request', async () => {
    jest
      .spyOn(authService, 'register')
      .mockImplementation(() =>
        Promise.reject(
          new BadRequestException('The email given already exist'),
        ),
      );

    const response = await controller
      .register({
        email: 'fake',
        password: 'test',
        name: 'test',
        nickname: 'test',
      })
      .catch((e) => e);

    expect(response).toBeInstanceOf(BadRequestException);
    expect(response).toMatchObject({
      message: 'The email given already exist',
      response: {
        statusCode: 400,
        message: 'The email given already exist',
      },
      status: 400,
    });
  });

  it('POST /login 200 success', async () => {
    jest.spyOn(authService, 'generateJwt').mockImplementation(() => ({
      accessToken: {
        token: 'test',
      },
      refreshToken: {
        token: 'test',
        expiresIn: 60,
        tokenType: 'Bearer',
      },
      user: {
        id: 'asdasd',
        name: 'username',
        email: 'email@emil.com',
        nickname: 'test',
      },
    }));

    const result = await controller.login({
      id: 'asdasd',
      name: 'username',
      email: 'email@emil.com',
      nickname: 'test',
    });

    expect(result).toMatchObject({
      accessToken: {
        token: 'test',
      },
      refreshToken: {
        token: 'test',
        expiresIn: 60,
        tokenType: 'Bearer',
      },
      user: {
        id: 'asdasd',
        name: 'username',
        email: 'email@emil.com',
        nickname: 'test',
      },
    });

    expect(result.accessToken.token).toEqual('test');
  });
});
