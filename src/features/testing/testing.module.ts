import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BlogsModule } from '../blogger-platform/blogs/blogs.module';

@Module({
  imports: [UserAccountsModule, BlogsModule],
  controllers: [TestingController],
})
export class TestingModule {}
