import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Blogger API')
    .setDescription('API for Blogger Platform')
    .setVersion('1.0')
    .addTag('Blogs-And-Posts')
    .addBearerAuth()
    .addBasicAuth()
    .addCookieAuth('refreshToken')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(GLOBAL_PREFIX, app, documentFactory, {
    customSiteTitle: 'Blogger Swagger',
  });
}
