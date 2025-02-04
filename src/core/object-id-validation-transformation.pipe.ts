import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

@Injectable()
export class ObjectIdValidationTransformationPipe
  implements PipeTransform<any>
{
  transform(value: string, metadata: ArgumentMetadata): any {
    if (metadata.metatype !== Types.ObjectId) {
      return value;
    }

    if (!isValidObjectId(value)) {
      throw new BadRequestException(`Invalid ObjectId: ${value}`);
    }

    return new Types.ObjectId(value);
  }
}

@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (!isValidObjectId(value)) {
      throw new BadRequestException([
        {
          field: metadata.data,
          message: `Invalid ObjectId: ${value}`,
        },
      ]);
    }

    return value;
  }
}
