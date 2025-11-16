import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://83.217.208.132:3000'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3002);
  console.log('Backend is running on http://localhost:3002');
}
bootstrap();

