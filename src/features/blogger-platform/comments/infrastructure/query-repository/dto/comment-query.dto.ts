import { UserOptionalContextDTO } from '../../../../../user-accounts/users/guards/dto/user-context.dto';
import { PostId } from '../../../../posts/domain/dto/post.dto';
import { GetCommentsQueryParamsInputDTO } from '../../../api/input-dto/get-comments-query-params.input-dto';

export class GetAllCommentsForPostQueryContextDTO {
  postId: PostId;
  user: UserOptionalContextDTO;
  query: GetCommentsQueryParamsInputDTO;
}
