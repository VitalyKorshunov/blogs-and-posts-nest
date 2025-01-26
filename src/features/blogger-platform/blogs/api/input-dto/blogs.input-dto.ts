import { CreateBlogDTO, UpdateBlogDTO } from '../../dto/blog.dto';
import { IsString, Length, Matches } from 'class-validator';
import {
  blogDescriptionConstraints,
  blogNameConstraints,
  blogWebsiteUrlConstraints,
} from '../../domain/blog.entity';

export class CreateBlogInputDTO implements CreateBlogDTO {
  @IsString()
  @Length(blogNameConstraints.minLength, blogNameConstraints.maxLength)
  name: string;

  @IsString()
  @Length(
    blogDescriptionConstraints.minLength,
    blogDescriptionConstraints.maxLength,
  )
  description: string;

  @Matches(
    '^https:\\/\\/([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$',
  )
  @Length(
    blogWebsiteUrlConstraints.minLength,
    blogWebsiteUrlConstraints.maxLength,
  )
  websiteUrl: string;
}

export class UpdateBlogInputDTO implements UpdateBlogDTO {
  @IsString()
  @Length(blogNameConstraints.minLength, blogNameConstraints.maxLength)
  name: string;

  @IsString()
  @Length(
    blogDescriptionConstraints.minLength,
    blogDescriptionConstraints.maxLength,
  )
  description: string;

  @Matches(
    '^https:\\/\\/([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$',
  )
  @Length(
    blogWebsiteUrlConstraints.minLength,
    blogWebsiteUrlConstraints.maxLength,
  )
  websiteUrl: string;
}
