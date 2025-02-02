import { LikeStatus } from '../../../../../core/dto/like-status';
import { IsEnum, IsString, Length } from 'class-validator';
import { commentContentConstraints } from '../../domain/comment.entity';

export class CreateCommentInputDTO {
  postId: string;
  userId: string;

  @IsString()
  @Length(
    commentContentConstraints.minLength,
    commentContentConstraints.maxLength,
  )
  content: string;
}

export class DeleteCommentInputDTO {
  userId: string;
  commentId: string;
}

export class UpdateCommentInputCommandDTO {
  userId: string;
  commentId: string;
  content: string;
}

export class UpdateCommentInputDTO {
  @IsString()
  @Length(
    commentContentConstraints.minLength,
    commentContentConstraints.maxLength,
  )
  content: string;
}

export class UpdateCommentLikeStatusInputCommandDTO {
  likeStatus: LikeStatus;
  commentId: string;
  userId: string;
}

export class UpdateCommentLikeStatusInputDTO {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
