import { INestApplication } from '@nestjs/common';

export const GLOBAL_PREFIX = '';

export function globalPrefixSetup(app: INestApplication) {
  app.setGlobalPrefix(GLOBAL_PREFIX);
}
