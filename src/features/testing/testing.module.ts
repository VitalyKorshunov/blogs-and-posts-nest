import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BloggerPlatformModule } from '../blogger-platform/blogger-platform.module';

@Module({
  imports: [UserAccountsModule, BloggerPlatformModule],
  controllers: [TestingController],
})
export class TestingModule {}
