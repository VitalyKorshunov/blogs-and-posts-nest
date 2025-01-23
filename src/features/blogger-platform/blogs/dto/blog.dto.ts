export interface CreateBlogDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export interface UpdateBlogDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export type BlogId = string;
