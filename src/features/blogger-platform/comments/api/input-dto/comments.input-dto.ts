import { LikeStatus } from '../../../likes/domain/dto/like-status';
import { IsEnum } from 'class-validator';
import { commentContentConstraints } from '../../domain/comment.entity';
import { IsStringWithTrimWithLength } from '../../../../../core/decorators/validators/is-string-with-trim-with-length';
import { Trim } from '../../../../../core/decorators/transform/trim';

export class CreateCommentInputDTO {
  @IsStringWithTrimWithLength(
    commentContentConstraints.minLength,
    commentContentConstraints.maxLength,
  )
  content: string;
}

export class UpdateCommentInputDTO {
  @IsStringWithTrimWithLength(
    commentContentConstraints.minLength,
    commentContentConstraints.maxLength,
  )
  content: string;
}

export class UpdateCommentLikeStatusInputDTO {
  @Trim()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
