import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './config/app.setup';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);

  await appContext.close();

  const DynamicAppModule = await AppModule.forRoot(coreConfig);

  const app = await NestFactory.create(DynamicAppModule);

  appSetup(app, coreConfig, DynamicAppModule);

  await app.listen(coreConfig.port);
  console.log(`Application is running on PORT: ${coreConfig.port}`);
}

bootstrap();
