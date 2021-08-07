import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ validateCustomDecorators: true }));
  app.enableCors();

  await app.listen(AppModule.port);

  Logger.log(`App running at port ${AppModule.port}`, 'Bootstrap');
}
bootstrap();
