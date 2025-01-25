import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { filtersSetup } from './filters.setup';
import { corsSetup } from './cors.setup';

export function appSetup(app: INestApplication) {
  corsSetup(app);
  globalPrefixSetup(app);
  pipesSetup(app);
  swaggerSetup(app);
  filtersSetup(app);
}
