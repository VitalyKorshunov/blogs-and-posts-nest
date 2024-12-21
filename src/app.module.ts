import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/testing/testing.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/blogs-and-posts-nest'),
    UserAccountsModule,
    TestingModule,
  ],
})
export class AppModule {}
