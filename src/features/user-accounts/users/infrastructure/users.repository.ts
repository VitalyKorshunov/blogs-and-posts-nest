import { Injectable, NotFoundException } from '@nestjs/common';
import { UserId } from '../domain/dto/user.dto';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { User } from '../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async isUserFoundByEmailOrLogin(loginOrEmail: string): Promise<boolean> {
    const queryToDb = loginOrEmail.includes('@') ? 'email' : 'login';

    const isUserFound: number = await this.dataSource.query(
      `
          SELECT COUNT(*)
          FROM users
          WHERE $1 = $2
      `,
      [queryToDb, loginOrEmail, DeletionStatus.NotDeleted],
    );
    return !!isUserFound;
  }

  async checkUserFoundOrNotFoundError(userId: UserId): Promise<void> {
    const isUserFound: number = await this.dataSource.query(
      `
          SELECT COUNT(*)
          FROM users
          WHERE id = $1
            AND 'deletionStatus' = $2
      `,
      [userId, DeletionStatus.NotDeleted],
    );

    if (!isUserFound) throw new NotFoundException('user not found');
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const result = await this.dataSource.query(
      `
          SELECT u.id,
                 u.login,
                 u.email,
                 u."passHash",
                 u."deletionStatus",
                 u."deletedAt",
                 u."createdAt",
                 u."updatedAt",
                 rp."expirationDate" as "expPassDate",
                 rp."recoveryCode",
                 ec."expirationDate" as "expEmailDate",
                 ec."confirmationCode",
                 ec."isConfirmed"
          FROM (SELECT *
                FROM users
                WHERE (login = $1 OR email = $1)
                  AND deletionStatus = $2) as u

                   LEFT JOIN "recoveryPassword" as rp
                             ON rp."userId" = u.id
                   LEFT JOIN "emailConfirmation" as ec
                             ON ec."userId" = u.id
      `,
      [loginOrEmail, DeletionStatus.NotDeleted],
    );

    return result.length ? User.restoreUserFromDB(result[0]) : null;
  }

  async getUserByIdOrNotFoundError(userId: UserId): Promise<User> {
    const result = await this.dataSource.query(
      `
          SELECT u.id,
                 u.login,
                 u.email,
                 u."passHash",
                 u."deletionStatus",
                 u."deletedAt",
                 u."createdAt",
                 u."updatedAt",
                 rp."expirationDate" as "expPassDate",
                 rp."recoveryCode",
                 ec."expirationDate" as "expEmailDate",
                 ec."confirmationCode",
                 ec."isConfirmed"
          FROM (SELECT *
                FROM users
                WHERE id = $1
                  AND deletionStatus = $2) as u

                   LEFT JOIN "recoveryPassword" as rp
                             ON rp."userId" = u.id
                   LEFT JOIN "emailConfirmation" as ec
                             ON ec."userId" = u.id
      `,
      [userId, DeletionStatus.NotDeleted],
    );

    if (!result.length) throw new NotFoundException('user not found');

    return User.restoreUserFromDB(result[0]);
  }

  async findUserByEmailConfirmationCode(
    emailConfirmationCode: string,
  ): Promise<User | null> {
    const result = await this.dataSource.query(
      `
          SELECT *
          FROM (SELECT *
                FROM (SELECT *
                      FROM "emailConfirmation"
                      WHERE "confirmationCode" = $1) AS ec
                         LEFT JOIN users AS u
                                   ON ec."userId" = u.id
                WHERE "deletionStatus" = $2) as u_with_ec

                   LEFT JOIN "recoveryPassword" as rp
                             ON u_with_ec."userId" = rp."userId"

      `,
      [emailConfirmationCode, DeletionStatus.NotDeleted],
    );

    return result.length ? User.restoreUserFromDB(result[0]) : null;
  }

  async findUserByPasswordRecoveryCode(
    passwordRecoveryCode: string,
  ): Promise<User | null> {
    const result = await this.dataSource.query(
      `
          SELECT *
          FROM (SELECT *
                FROM (SELECT *
                      FROM "recoveryPassword"
                      WHERE "recoveryCode" = $1) AS rp
                         LEFT JOIN users AS u
                                   ON rp."userId" = u.id
                WHERE "deletionStatus" = $2) as u_with_rp
                   LEFT JOIN "emailConfirmation" as ec
                             ON u_with_rp."userId" = ec."userId"
      `,
      [passwordRecoveryCode, DeletionStatus.NotDeleted],
    );

    return result.length ? User.restoreUserFromDB(result[0]) : null;
  }

  async createUser(user: User): Promise<UserId> {
    try {
      const result = await this.dataSource.query(
        `
            WITH u AS (
            INSERT
            INTO users(login,
                       email,
                       "passHash",
                       "createdAt",
                       "updatedAt",
                       "deletedAt",
                       "deletionStatus")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
                ), ec AS (
            INSERT
            INTO "emailConfirmation"("expirationDate",
                                     "confirmationCode",
                                     "isConfirmed",
                                     "userId")
            SELECT $10, $11, $12, u.id
            FROM u
                RETURNING "userId"
                ), rp AS (
                INSERT
            INTO "recoveryPassword"("expirationDate",
                                    "recoveryCode",
                                    "userId")
                SELECT $8, $9, ec."userId" 
                    FROM ec
                        RETURNING "userId"
                )
            

            SELECT "userId" as "userId"
            FROM rp;
        `,
        [
          user.login, // $1
          user.email, // $2
          user.passHash, // $3
          user.createdAt, // $4
          user.updatedAt, // $5
          user.deletedAt, // $6
          user.deletionStatus, // $7
          user.recoveryPassword.expirationDate, // $8
          user.recoveryPassword.recoveryCode, // $9
          user.emailConfirmation.expirationDate, // $10
          user.emailConfirmation.confirmationCode, // $11
          user.emailConfirmation.isConfirmed, // $12
        ],
      );

      return result[0].userId;
    } catch (e) {
      throw new Error(e);
    }
  }

  async saveChange(user: User): Promise<void> {
    try {
      await this.dataSource.query(
        `
            UPDATE users
            SET login            = $1,
                email            = $2,
                "passHash"       = $3,
                "updatedAt"      = $4,
                "deletedAt"      = $5,
                "deletionStatus" = $6
            WHERE id = $12;

            UPDATE recoveryPassword
            SET "expirationDate" = $7,
                "recoveryCode"   = $8
            WHERE "userId" = $12;

            UPDATE "emailConfirmation"
            SET "expirationDate"   = $9,
                "confirmationCode" = $10,
                "isConfirmed"      = $11
            WHERE "userId" = $12;

        `,
        [
          user.login, // $1
          user.email, // $2
          user.passHash, // $3
          user.updatedAt, // $4
          user.deletedAt, // $5
          user.deletionStatus, // $6
          user.recoveryPassword.expirationDate, // $7
          user.recoveryPassword.recoveryCode, // $8
          user.emailConfirmation.expirationDate, // $9
          user.emailConfirmation.confirmationCode, // $10
          user.emailConfirmation.isConfirmed, // $11
          user.id, // $12
        ],
      );
    } catch (e) {
      throw new Error(e);
    }
  }
}
