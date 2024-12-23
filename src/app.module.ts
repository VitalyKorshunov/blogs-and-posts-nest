import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/testing/testing.module';
import { BloggerPlatformModule } from './features/blogger-platform/blogger-platform.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/blogs-and-posts-nest'),
    UserAccountsModule,
    BloggerPlatformModule,
    TestingModule,
  ],
})
export class AppModule {}
