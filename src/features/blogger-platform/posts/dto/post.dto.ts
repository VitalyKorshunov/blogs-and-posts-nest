export class CreatePostDTO {
  title: string;
  content: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
}

export class UpdatePostDTO {
  title: string;
  content: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
}

export type PostId = string;
