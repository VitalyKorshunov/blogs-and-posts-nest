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
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UsersService } from '../application/users.service';
import { UserId } from '../dto/user.dto';
import { UserViewDto } from './view-dto/users.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CreateUserInputDTO } from './input-dto/users.input-dto';
import { ValidationPipe } from '../../../core/pipe-example.pipe';
import { BasicAuthGuard } from '../guards/basic.guard';

@Controller('users')
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(
    @Body() createUserInputDTO: CreateUserInputDTO,
  ): Promise<UserViewDto> {
    const userId: UserId =
      await this.usersService.createUserByAdmin(createUserInputDTO);

    return await this.usersQueryRepository.getUserByIdOrNotFoundError(userId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteUser(@Param('userId', new ValidationPipe()) userId: UserId) {
    return await this.usersService.deleteUser(userId);
  }

  @Get()
  // @UseGuards(BasicAuthGuard)
  async findAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return await this.usersQueryRepository.getAllUsers(query);
  }
}
