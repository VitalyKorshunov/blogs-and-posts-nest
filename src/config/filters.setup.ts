import { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from '../core/exeption.filter';

export function filtersSetup(app: INestApplication) {
  app.useGlobalFilters(new HttpExceptionFilter());
}
