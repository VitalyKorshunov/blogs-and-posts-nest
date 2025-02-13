import { Injectable } from '@nestjs/common';
import { UserId } from '../../domain/dto/user.dto';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { User } from '../../domain/user.entity';
import { UsersRepository } from '../users.repository';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async getMeInfo(userId: UserId): Promise<MeViewDto> {
    const user: User =
      await this.usersRepository.getUserByIdOrNotFoundError(userId);

    return MeViewDto.mapToView(user);
  }
}
