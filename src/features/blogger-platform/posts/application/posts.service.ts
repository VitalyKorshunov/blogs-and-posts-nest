import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import {
  CreatePostInputDTO,
  UpdatePostInputDTO,
} from '../api/input-dto/post.input-dto';
import { PostId } from '../dto/post.dto';
import { BlogDocument } from '../../blogs/domain/blog.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostInputDTO): Promise<PostId> {
    //TODO: Оставить создание метода для поиска блога в postsRepository или использовать blogsRepository?
    const blog: BlogDocument =
      await this.postsRepository.getBlogByIdOrNotFoundError(dto.blogId);

    const post: PostDocument = this.PostModel.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    return post.id;
  }

  async deletePost(postId: PostId): Promise<void> {
    const post: PostDocument =
      await this.postsRepository.getPostByIdOrNotFoundError(postId);

    post.permanentDelete();

    await this.postsRepository.save(post);
  }

  async updatePost(dto: UpdatePostInputDTO, postId: PostId): Promise<void> {
    const blog: BlogDocument =
      await this.postsRepository.getBlogByIdOrNotFoundError(dto.blogId);

    const post: PostDocument =
      await this.postsRepository.getPostByIdOrNotFoundError(postId);

    post.updatePost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);
  }
}
