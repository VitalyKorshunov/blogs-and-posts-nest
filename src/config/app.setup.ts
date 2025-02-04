import { DynamicModule, INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { exceptionFilterSetup } from './exception-filter.setup';
import { corsSetup } from './cors.setup';
import { cookieParserSetup } from './cookie-parser.setup';
import { CoreConfig } from '../core/core.config';
import { validationConstraintSetup } from './validation-constraint.setup';

export function appSetup(
  app: INestApplication,
  coreConfig: CoreConfig,
  DynamicAppModule: DynamicModule,
) {
  corsSetup(app);
  globalPrefixSetup(app);
  pipesSetup(app);
  exceptionFilterSetup(app);
  cookieParserSetup(app);
  validationConstraintSetup(app, DynamicAppModule);

  if (coreConfig.isSwaggerEnabled) {
    swaggerSetup(app);
  }
}
