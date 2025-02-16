import { CreateBlogDTO, UpdateBlogDTO } from './dto/blog.dto';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { BadRequestException } from '@nestjs/common';

export const blogNameConstraints = {
  minLength: 1,
  maxLength: 15,
};

export const blogDescriptionConstraints = {
  minLength: 1,
  maxLength: 500,
};

export const blogWebsiteUrlConstraints = {
  minLength: 11,
  maxLength: 100,
  match: new RegExp(
    `^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$`,
  ),
};

type BlogRowDataFromDB = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletionStatus: DeletionStatus;
  deletedAt: Date | null;
};

export class Blog {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletionStatus: DeletionStatus;
  deletedAt: Date | null;

  static createBlog(dto: CreateBlogDTO): Blog {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    blog.createdAt = new Date();
    blog.updatedAt = new Date();
    blog.deletionStatus = DeletionStatus.NotDeleted;
    blog.deletedAt = null;

    return blog;
  }

  static restoreBlogFromDB(dto: BlogRowDataFromDB): Blog {
    const blog = new this();
    blog.id = dto.id;
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = dto.isMembership;
    blog.createdAt = dto.createdAt;
    blog.updatedAt = dto.updatedAt;
    blog.deletionStatus = dto.deletionStatus;
    blog.deletedAt = dto.deletedAt;

    return blog;
  }

  updateBlog(dto: UpdateBlogDTO): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;

    this.updatedAt = new Date();
  }

  permanentDelete(): void {
    if (this.deletionStatus === DeletionStatus.PermanentDeleted) {
      throw new BadRequestException('blog already deleted');
    }

    this.deletionStatus = DeletionStatus.PermanentDeleted;
    this.deletedAt = new Date();

    this.updatedAt = new Date();
  }
}

/*export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelType = Model<BlogDocument> & typeof Blog;*/
