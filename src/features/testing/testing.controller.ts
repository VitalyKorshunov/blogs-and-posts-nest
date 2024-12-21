import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../user-accounts/domain/user.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  @Delete('delete-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.UserModel.deleteMany({});
  }
}
