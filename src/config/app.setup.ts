import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';
import { globalPrefixSetup } from './global-prefix.setup';

export function appSetup(app: INestApplication) {
  app.enableCors();
  globalPrefixSetup(app);
  pipesSetup(app);
  swaggerSetup(app);
}
