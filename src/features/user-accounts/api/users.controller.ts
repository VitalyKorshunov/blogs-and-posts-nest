import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UsersService } from '../application/users.service';
import { UserId } from '../dto/user.dto';
import { UserViewDto } from './view-dto/users.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CreateUserInputDTO } from './input-dto/users.input-dto';

@Controller('users')
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  async createUser(@Body() body: CreateUserInputDTO): Promise<UserViewDto> {
    const userId: UserId = await this.usersService.createUserByAdmin(body);

    return await this.usersQueryRepository.getUserByIdOrNotFoundError(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: UserId) {
    return await this.usersService.deleteUser(id);
  }

  @Get()
  async findAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return await this.usersQueryRepository.getAllUsers(query);
  }
}
