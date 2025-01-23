import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import {
  CreateCommentInputDTO,
  DeleteCommentInputDTO,
  UpdateCommentInputDTO,
  UpdateCommentLikeStatusInputDTO,
} from '../api/input-dto/comments.input-dto';
import {
  CommentId,
  CreateCommentDTO,
  UpdateCommentDTO,
} from '../dto/comment.dto';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { UserDocument } from '../../../user-accounts/domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import {
  Like,
  LikeDocument,
  LikeModelType,
} from '../../likes/domain/like.entity';
import { LikesRepository } from '../../likes/infrastucture/likes.repository';
import { CreateLikeDTO, LikesAndDislikesCount } from '../../likes/dto/like.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private likesRepository: LikesRepository,
  ) {}

  async createComment(dto: CreateCommentInputDTO): Promise<CommentId> {
    await this.postsRepository.checkPostFoundOrNotFoundError(dto.postId);

    const user: UserDocument =
      await this.usersRepository.getUserByIdOrNotFoundError(dto.userId);

    const createCommentDTO: CreateCommentDTO = {
      content: dto.content,
      postId: dto.postId,
      userId: dto.userId,
      userLogin: user.login,
    };

    const comment: CommentDocument =
      this.CommentModel.createComment(createCommentDTO);

    await this.commentsRepository.save(comment);

    return comment.id;
  }

  async deleteComment(dto: DeleteCommentInputDTO): Promise<void> {
    await this.usersRepository.checkUserFoundOrNotFoundError(dto.userId);

    const comment: CommentDocument =
      await this.commentsRepository.getCommentByIdOrNotFoundError(
        dto.commentId,
      );

    comment.validateUserOwnershipOrThrow(dto.userId);

    comment.permanentDelete();

    await this.commentsRepository.save(comment);
  }

  async updateComment(dto: UpdateCommentInputDTO): Promise<void> {
    await this.usersRepository.checkUserFoundOrNotFoundError(dto.userId);

    const comment: CommentDocument =
      await this.commentsRepository.getCommentByIdOrNotFoundError(
        dto.commentId,
      );

    comment.validateUserOwnershipOrThrow(dto.userId);

    const updateCommentDTO: UpdateCommentDTO = {
      content: dto.content,
    };
    comment.updateComment(updateCommentDTO);

    await this.commentsRepository.save(comment);
  }

  async updateCommentLikeStatus(
    dto: UpdateCommentLikeStatusInputDTO,
  ): Promise<void> {
    const comment: CommentDocument =
      await this.commentsRepository.getCommentByIdOrNotFoundError(
        dto.commentId,
      );

    const user: UserDocument =
      await this.usersRepository.getUserByIdOrNotFoundError(dto.userId);

    let like: LikeDocument | null = await this.likesRepository.findLike(
      dto.commentId,
      dto.userId,
    );

    if (like) {
      like.updateLike(dto.likeStatus);
    } else {
      const createLikeDTO: CreateLikeDTO = {
        commentOrPostId: dto.commentId,
        userId: dto.userId,
        login: user.login,
        likeStatus: dto.likeStatus,
      };

      like = this.LikeModel.createLike(createLikeDTO);
    }

    await this.likesRepository.save(like);

    const likesAndDislikesCount: LikesAndDislikesCount =
      await this.likesRepository.getLikesAndDislikesCount(dto.commentId);

    comment.updateLikeInfo(likesAndDislikesCount);

    await this.commentsRepository.save(comment);
  }
}
