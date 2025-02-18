import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as process from 'node:process';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (process.env.enviromens !== 'production') {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        error: exception.toString(),
        stack: exception.stack,
      });
    } else {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('something went wrong');
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const errorResponse = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();

      responseBody.message.forEach((m) =>
        //TODO: Переписать
        // @ts-expect-error
        errorResponse.errorsMessages.push(m),
      );

      response.status(status).json(errorResponse);
    } else {
      response.sendStatus(status);
    }
  }
}
