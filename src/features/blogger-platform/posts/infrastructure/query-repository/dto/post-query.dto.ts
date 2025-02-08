import { UserOptionalContextDTO } from '../../../../../user-accounts/users/guards/dto/user-context.dto';
import { GetPostsQueryParamsInputDTO } from '../../../api/input-dto/get-posts-query-params.input-dto';

export class GetAllPostsQueryContextDTO {
  user: UserOptionalContextDTO;
  query: GetPostsQueryParamsInputDTO;
}
