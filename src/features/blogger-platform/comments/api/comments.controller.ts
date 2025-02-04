import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/query-repository/comments.query-repository';
import { CommentId } from '../domain/dto/comment.dto';
import { CommentViewDTO } from './view-dto/comments.view-dto';
import { ObjectIdValidationPipe } from '../../../../core/object-id-validation-transformation.pipe';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import {
  UpdateCommentInputDTO,
  UpdateCommentLikeStatusInputDTO,
} from './input-dto/comments.input-dto';
import {
  ExtractUserFromRequest,
  ExtractUserOptionalFromRequest,
} from '../../../user-accounts/guards/decorators/extract-user-from-request.decorator';
import {
  UserContextDTO,
  UserOptionalContextDTO,
} from '../../../user-accounts/guards/dto/user-context.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateCommentLikeStatusCommand } from '../application/use-cases/update-comment-like-status.use-case';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Put(':commentId/like-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @Param('commentId') commentId: CommentId,
    @Body() updateCommentLikeInputDTO: UpdateCommentLikeStatusInputDTO,
    @ExtractUserFromRequest() user: UserContextDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand({
        likeStatus: updateCommentLikeInputDTO.likeStatus,
        commentId: commentId,
        userId: user.userId,
      }),
    );
  }

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId') commentId: CommentId,
    @Body() updateCommentInputDTO: UpdateCommentInputDTO,
    @ExtractUserFromRequest() user: UserContextDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommand({
        commentId: commentId,
        content: updateCommentInputDTO.content,
        userId: user.userId,
      }),
    );
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId', ObjectIdValidationPipe) commentId: CommentId,
    @ExtractUserFromRequest() user: UserContextDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteCommentCommand({
        userId: user.userId,
        commentId: commentId,
      }),
    );
  }

  @Get(':commentId')
  @UseGuards(JwtOptionalAuthGuard)
  getComment(
    @Param('commentId', ObjectIdValidationPipe) commentId: CommentId,
    @ExtractUserOptionalFromRequest() user: UserOptionalContextDTO,
  ): Promise<CommentViewDTO> {
    return this.commentQueryRepository.getCommentByIdOrNotFoundError(
      commentId,
      user,
    );
  }
}
