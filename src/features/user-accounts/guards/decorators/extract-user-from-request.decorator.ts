import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  UserContextDTO,
  UserOptionalContextDTO,
} from '../dto/user-context.dto';

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDTO => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new Error(`There is no user in the request object`);
    }

    return user;
  },
);

export const ExtractUserOptionalFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserOptionalContextDTO => {
    const request = context.switchToHttp().getRequest();

    return request.user ?? { userId: null };
  },
);
