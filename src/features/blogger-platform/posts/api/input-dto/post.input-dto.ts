import { CreatePostDTO, UpdatePostDTO } from '../../dto/post.dto';

export class CreatePostInputDTO implements Omit<CreatePostDTO, 'blogName'> {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class CreatePostForBlogInputDTO
  implements Omit<CreatePostDTO, 'blogName' | 'blogId'>
{
  title: string;
  shortDescription: string;
  content: string;
}

export class UpdatePostInputDTO implements Omit<UpdatePostDTO, 'blogName'> {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
