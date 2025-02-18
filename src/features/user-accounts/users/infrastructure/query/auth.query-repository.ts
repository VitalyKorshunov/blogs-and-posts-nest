import { Injectable } from '@nestjs/common';
import { UserId } from '../../domain/dto/user.dto';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { UserDocument } from '../../domain/user.entity';
import { UsersRepository } from '../users.repository';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async getMeInfo(userId: UserId): Promise<MeViewDto> {
    const user: UserDocument =
      await this.usersRepository.getUserByIdOrNotFoundError(userId);

    return MeViewDto.mapToView(user);
  }
}
