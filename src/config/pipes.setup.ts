import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';

export const errorFormatter = (errors: any) => {
  const errorsForResponse = [];

  errors.forEach((e) => {
    const constraintsKeys = Object.keys(e.constraints);
    constraintsKeys.forEach((key) => {
      //TODO: Переделать
      // @ts-expect-error
      errorsForResponse.push({
        message: e.constraints[key],
        field: e.property,
      });
    });
  });

  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        throw new BadRequestException(formattedErrors);
      },
    }),
  );
}
