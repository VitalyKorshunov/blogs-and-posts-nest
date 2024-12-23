import { CreateBlogDTO, UpdateBlogDTO } from '../../dto/blog.dto';

export class CreateBlogInputDTO implements CreateBlogDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogInputDTO implements UpdateBlogDTO {
  name: string;
  description: string;
  websiteUrl: string;
}
