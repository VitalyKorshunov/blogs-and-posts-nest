import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './config/app.setup';

export const LAST_NEWEST_LIKES_COUNT_FOR_POST = 3; //TODO: Перенести в env

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSetup(app);

  await app.listen(5000);
}

bootstrap();
