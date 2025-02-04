import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, required: true, ...blogNameConstraints })
  name: string;

  @Prop({ type: String, required: true, ...blogDescriptionConstraints })
  description: string;

  @Prop({ type: String, required: true, ...blogWebsiteUrlConstraints })
  websiteUrl: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({
    enum: DeletionStatus,
    type: String,
    default: DeletionStatus.NotDeleted,
  })
  deletionStatus: DeletionStatus;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createBlog(dto: CreateBlogDTO): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return blog as BlogDocument;
  }

  updateBlog(dto: UpdateBlogDTO): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  permanentDelete(): void {
    if (this.deletionStatus === DeletionStatus.PermanentDeleted) {
      throw new BadRequestException('blog already deleted');
    }

    this.deletionStatus = DeletionStatus.PermanentDeleted;
    this.deletedAt = new Date();
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelType = Model<BlogDocument> & typeof Blog;
