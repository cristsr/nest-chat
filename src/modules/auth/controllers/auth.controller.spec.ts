// import { Test, TestingModule } from '@nestjs/testing';
// import {
//   closeMongodConnection,
//   rootMongooseTestModule,
// } from 'database/mongodb-testing.config';
// import { MongooseModule } from '@nestjs/mongoose';
// import { ConfigModule } from '@nestjs/config';
// import { AuthService } from '@modules/auth/services/auth.service';
// import { User, UserSchema } from '@modules/user/entities/user.entity';
// import { UserModule } from '@modules/user/user.module';
// import { AuthController } from './auth.controller';
// import { JwtModule } from '@nestjs/jwt';
// import { BadRequestException } from '@nestjs/common';
// import { MailerModule } from '@nestjs-modules/mailer';
//
// describe('AuthController', () => {
//   let controller: AuthController;
//   let authService: AuthService;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [
//         rootMongooseTestModule(),
//         MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
//         ConfigModule,
//         JwtModule.register({}),
//         MailerModule.register({
//           transport: {
//             host: 'smtp.googlemail.com',
//           },
//         }),
//         UserModule,
//       ],
//       controllers: [AuthController],
//       providers: [AuthService],
//     }).compile();
//
//     controller = module.get<AuthController>(AuthController);
//     authService = module.get<AuthService>(AuthService);
//   });
//
//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
//
//   it('POST /register 200 success', async () => {
//     jest
//       .spyOn(authService, 'register')
//       .mockImplementation(() => Promise.resolve({ success: true }));
//
//     const result = await controller.register({
//       email: 'test',
//       password: 'test',
//       name: 'test',
//     });
//
//     expect(result).toMatchObject({ success: true });
//   });
//
//   it('POST /register 400 bad request', async () => {
//     jest
//       .spyOn(authService, 'register')
//       .mockImplementation(() =>
//         Promise.reject(
//           new BadRequestException('The email given already exist'),
//         ),
//       );
//
//     const response = await controller
//       .register({
//         email: 'fake',
//         password: 'test',
//         name: 'test',
//       })
//       .catch((e) => e);
//
//     expect(response).toBeInstanceOf(BadRequestException);
//     expect(response).toMatchObject({
//       message: 'The email given already exist',
//       response: {
//         statusCode: 400,
//         message: 'The email given already exist',
//       },
//       status: 400,
//     });
//   });
//
//   it('POST /generateJwt 200 success', async () => {
//     jest.spyOn(authService, 'generateJwt').mockImplementation(() =>
//       Promise.resolve({
//         credentials: {
//           accessToken: 'token test',
//           expiresIn: '3600s',
//           refreshToken: 'refresh_token',
//           tokenType: 'bearer',
//         },
//         user: {
//           _id: 'asdasd',
//           username: 'username',
//           email: 'email@emil.com',
//         },
//       }),
//     );
//
//     const result = await controller.generateJwt({
//       username: 'test',
//       password: 'test',
//     });
//
//     expect(result).toMatchObject({
//       credentials: {
//         accessToken: 'token test',
//         expiresIn: '3600s',
//         refreshToken: 'refresh_token',
//         tokenType: 'bearer',
//       },
//       user: {
//         _id: 'asdasd',
//         username: 'username',
//         email: 'email@emil.com',
//       },
//     });
//
//     expect(result.credentials.accessToken).toEqual('token test');
//   });
//
//   it('GET /profile 200 success', async () => {
//     const result = await controller.getProfile({
//       user: {
//         email: 'test@test',
//         username: 'test',
//       },
//     });
//
//     expect(result).toMatchObject({
//       email: 'test@test',
//       username: 'test',
//     });
//   });
//
//   afterAll(async () => {
//     await closeMongodConnection();
//   });
// });
