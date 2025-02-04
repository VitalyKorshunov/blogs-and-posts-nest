import { LikeStatus } from '../../../likes/domain/dto/like-status';
import { IsEnum, IsMongoId } from 'class-validator';
import {
  postContentConstraints,
  postShortDescriptionConstraints,
  postTitleConstraints,
} from '../../domain/post.entity';
import { IsStringWithTrimWithLength } from '../../../../../core/decorators/validators/is-string-with-trim-with-length';
import { Trim } from '../../../../../core/decorators/transform/trim';
import { BlogIdIsExist } from '../../../blogs/api/validation/blog-id-is-exist.decorator';

export class CreatePostInputDTO {
  @IsStringWithTrimWithLength(
    postTitleConstraints.minLength,
    postTitleConstraints.maxLength,
  )
  title: string;

  @IsStringWithTrimWithLength(
    postShortDescriptionConstraints.minLength,
    postShortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsStringWithTrimWithLength(
    postContentConstraints.minLength,
    postContentConstraints.maxLength,
  )
  content: string;

  @Trim()
  @IsMongoId()
  @BlogIdIsExist()
  blogId: string;
}

export class CreatePostForBlogInputDTO {
  @IsStringWithTrimWithLength(
    postTitleConstraints.minLength,
    postTitleConstraints.maxLength,
  )
  title: string;

  @IsStringWithTrimWithLength(
    postShortDescriptionConstraints.minLength,
    postShortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsStringWithTrimWithLength(
    postContentConstraints.minLength,
    postContentConstraints.maxLength,
  )
  content: string;
}

export class UpdatePostInputDTO {
  @IsStringWithTrimWithLength(
    postTitleConstraints.minLength,
    postTitleConstraints.maxLength,
  )
  title: string;

  @IsStringWithTrimWithLength(
    postShortDescriptionConstraints.minLength,
    postShortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsStringWithTrimWithLength(
    postContentConstraints.minLength,
    postContentConstraints.maxLength,
  )
  content: string;

  @Trim()
  @IsMongoId()
  @BlogIdIsExist()
  blogId: string;
}

export class UpdatePostLikeStatusInputDTO {
  @Trim()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
