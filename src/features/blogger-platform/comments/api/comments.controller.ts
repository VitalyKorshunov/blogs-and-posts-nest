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
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { CommentId } from '../dto/comment.dto';
import { CommentViewDTO } from './view-dto/comments.view-dto';
import { ObjectIdValidationPipe } from '../../../../core/object-id-validation-transformation.pipe';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import {
  DeleteCommentInputDTO,
  UpdateCommentInputCommandDTO,
  UpdateCommentInputDTO,
  UpdateCommentLikeStatusInputCommandDTO,
  UpdateCommentLikeStatusInputDTO,
} from './input-dto/comments.input-dto';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/extract-user-from-request.decorator';
import { UserContextDTO } from '../../../user-accounts/guards/dto/user-context.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateCommentLikeStatusCommand } from '../application/use-cases/update-comment-like-status.use-case';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';

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
    const dto: UpdateCommentLikeStatusInputCommandDTO = {
      likeStatus: updateCommentLikeInputDTO.likeStatus,
      commentId: commentId,
      userId: user.userId,
    };

    await this.commandBus.execute(new UpdateCommentLikeStatusCommand(dto));
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
    const dto: UpdateCommentInputCommandDTO = {
      commentId: commentId,
      content: updateCommentInputDTO.content,
      userId: user.userId,
    };
    await this.commandBus.execute(new UpdateCommentCommand(dto));
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId', ObjectIdValidationPipe) commentId: CommentId,
    @ExtractUserFromRequest() user: UserContextDTO,
  ): Promise<void> {
    const dto: DeleteCommentInputDTO = {
      userId: user.userId,
      commentId: commentId,
    };
    await this.commandBus.execute(new DeleteCommentCommand(dto));
  }

  @Get(':commendId')
  getComment(
    @Param('commendId', ObjectIdValidationPipe) commentId: CommentId,
  ): Promise<CommentViewDTO> {
    return this.commentQueryRepository.getCommentByIdOrNotFoundError(commentId);
  }
}
