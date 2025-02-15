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
import { UserId } from '../domain/dto/user.dto';
import { UserViewDto } from './view-dto/users.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CreateUserInputDTO } from './input-dto/users.input-dto';
import { BasicAuthGuard } from '../guards/basic/basic.guard';
import { CreateUserByAdminCommand } from '../application/use-cases/create-user-by-admin-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../application/use-cases/delete-user.use-case';
import { ObjectIdValidationPipe } from '../../../../core/object-id-validation-transformation.pipe';

@Controller('sa/users')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post()
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard)
  async createUser(
    @Body() createUserInputDTO: CreateUserInputDTO,
  ): Promise<UserViewDto> {
    const userId: UserId = await this.commandBus.execute(
      new CreateUserByAdminCommand(createUserInputDTO),
    );

    return await this.usersQueryRepository.getUserByIdOrNotFoundError(userId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard)
  async deleteUser(
    @Param('userId', ObjectIdValidationPipe) userId: UserId,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(userId));
  }

  @Get()
  // @UseGuards(BasicAuthGuard)
  async findAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return await this.usersQueryRepository.getAllUsers(query);
  }
}
