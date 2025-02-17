import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectConnection() private readonly databaseConnection: Connection,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    const collections = await this.databaseConnection.listCollections();

    const promises = collections.map((collection) =>
      this.databaseConnection.collection(collection.name).deleteMany({}),
    );
    await Promise.all(promises);

    await this.dataSource.query(
      `
DO $$
BEGIN

          DELETE
          FROM security;
          
          DELETE
          FROM "emailConfirmation";
          
          DELETE
          FROM "recoveryPassword";
          
          DELETE
          FROM "users";
          
          DELETE
          FROM "blogs";

END $$
      `,
    );

    return {
      status: 'succeeded',
    };
  }
}
