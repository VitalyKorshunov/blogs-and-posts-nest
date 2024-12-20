import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UsersAdminService } from '../application/users-admin.service';
import { CreateUserDTO } from '../dto/user.dto';
import { UserViewDto } from './view-dto/users.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';

@Controller('users')
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private usersService: UsersAdminService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  async createUser(@Body() body: CreateUserDTO): Promise<UserViewDto> {
    const newUserId = await this.usersService.createUserByAdmin(body);

    return await this.usersQueryRepository.findUserOrNotFoundError(newUserId);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }

  @Get()
  async findAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return await this.usersQueryRepository.findAllUsers(query);
  }
}
