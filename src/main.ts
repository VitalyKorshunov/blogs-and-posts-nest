import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './config/app.setup';
import { CoreConfig } from './core/core.config';
import { swaggerSetup } from './config/swagger.setup';

export const LAST_NEWEST_LIKES_COUNT_FOR_POST = 3; //TODO: Перенести в env

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);

  const DynamicAppModule = await AppModule.forRoot(coreConfig);

  const app = await NestFactory.create(DynamicAppModule);

  if (coreConfig.isSwaggerEnabled) {
    swaggerSetup(app);
  }

  appSetup(app);

  await appContext.close();

  await app.listen(coreConfig.port);
  console.log(`Application is running on PORT: ${coreConfig.port}`);
}

bootstrap();
