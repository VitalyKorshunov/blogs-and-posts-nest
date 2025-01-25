export class CreateBlogDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export type BlogId = string;
