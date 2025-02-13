import { User } from '../../domain/user.entity';
import { OmitType } from '@nestjs/swagger';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView(user: User): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user.id!;
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();

    return dto;
  }
}

export class MeViewDto extends OmitType(UserViewDto, [
  'id',
  'createdAt',
] as const) {
  userId: string;

  static mapToView(user: User): MeViewDto {
    const dto = new MeViewDto();

    dto.login = user.login;
    dto.email = user.email;
    dto.userId = user.id;

    return dto;
  }
}
