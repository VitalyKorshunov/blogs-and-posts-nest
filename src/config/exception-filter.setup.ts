import { INestApplication } from '@nestjs/common';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../core/exeption.filter';

export function exceptionFilterSetup(app: INestApplication) {
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
}
