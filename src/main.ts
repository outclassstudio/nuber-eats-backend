import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //class-transformer설치해야함
  app.useGlobalPipes(new ValidationPipe());
  //미들웨서 사용시 함수로만 사용 가능
  // app.use(jwtMiddleware);
  await app.listen(3000);
}
bootstrap();
