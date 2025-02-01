import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { CommentId } from '../dto/comment.dto';
import { CommentViewDTO } from './view-dto/comments.view-dto';
import { ObjectIdValidationPipe } from '../../../../core/validation.pipe';
import { JwtAuthGuard } from '../../../user-accounts/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import { DeleteCommentInputDTO } from './input-dto/comments.input-dto';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  getComment(
    @Param('id', new ObjectIdValidationPipe()) commentId: CommentId,
  ): Promise<CommentViewDTO> {
    return this.commentQueryRepository.getCommentByIdOrNotFoundError(commentId);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId') commentId: CommentId,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    const dto: DeleteCommentInputDTO = {
      userId: user.userId,
      commentId: commentId,
    };
    await this.commandBus.execute(new DeleteCommentCommand(dto));
  }
}
