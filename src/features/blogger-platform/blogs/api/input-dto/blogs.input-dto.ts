import { Matches } from 'class-validator';
import {
  blogDescriptionConstraints,
  blogNameConstraints,
  blogWebsiteUrlConstraints,
} from '../../domain/blog.entity';
import { IsStringWithTrimWithLength } from '../../../../../core/decorators/validators/is-string-with-trim-with-length';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogInputDTO {
  @IsStringWithTrimWithLength(
    blogNameConstraints.minLength,
    blogNameConstraints.maxLength,
  )
  name: string;

  @IsStringWithTrimWithLength(
    blogDescriptionConstraints.minLength,
    blogDescriptionConstraints.maxLength,
  )
  description: string;

  @ApiProperty({
    example: 'https://some-site.com/first/second/etc',
    pattern: blogWebsiteUrlConstraints.match.source,
  })
  @IsStringWithTrimWithLength(
    blogWebsiteUrlConstraints.minLength,
    blogWebsiteUrlConstraints.maxLength,
  )
  @Matches(blogWebsiteUrlConstraints.match.source)
  websiteUrl: string;
}

export class UpdateBlogInputDTO {
  @IsStringWithTrimWithLength(
    blogNameConstraints.minLength,
    blogNameConstraints.maxLength,
  )
  name: string;

  @IsStringWithTrimWithLength(
    blogDescriptionConstraints.minLength,
    blogDescriptionConstraints.maxLength,
  )
  description: string;

  @ApiProperty({
    example: 'https://some-site.com/first/second/etc',
    pattern: blogWebsiteUrlConstraints.match.source,
  })
  @IsStringWithTrimWithLength(
    blogWebsiteUrlConstraints.minLength,
    blogWebsiteUrlConstraints.maxLength,
  )
  @Matches(blogWebsiteUrlConstraints.match.source)
  websiteUrl: string;
}
