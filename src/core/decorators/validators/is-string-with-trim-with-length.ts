import { applyDecorators } from '@nestjs/common';
import { IsString, Length } from 'class-validator';
import { Trim } from '../transform/trim';

export const IsStringWithTrimWithLength = (
  minLength: number,
  maxLength?: number,
) => applyDecorators(IsString(), Trim(), Length(minLength, maxLength));
