import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SecurityQueryRepository } from '../infrastructure/security.query-repository';
import { RefreshTokenAuthGuard } from '../../users/guards/cookie/refresh-token.guard';
import { ExtractUserFromRequest } from '../../users/guards/decorators/extract-user-from-request.decorator';
import { RefreshTokenPayloadDTO } from '../../users/guards/dto/tokens.dto';
import { SecurityViewDTO } from './view-dto/security.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllUserSessionsExpectCurrentCommand } from '../application/use-cases/delete-all-user-sessions-expect-current.use-case';
import { DeleteUserSessionByDeviceIdCommand } from '../application/use-cases/delete-user-session-by-device-id.use-case';
import { DeviceId } from '../domain/dto/security.dto';
import { ApiCookieAuth } from '@nestjs/swagger';

@ApiCookieAuth()
@Controller('security')
export class SecurityController {
  constructor(
    private securityQueryRepository: SecurityQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('devices')
  @UseGuards(RefreshTokenAuthGuard)
  async getAllDevices(
    @ExtractUserFromRequest() refreshTokenPayload: RefreshTokenPayloadDTO,
  ): Promise<SecurityViewDTO[]> {
    return await this.securityQueryRepository.getAllUserActiveSessions(
      refreshTokenPayload.userId,
    );
  }

  @Delete('devices')
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllUserDevicesExpectCurrent(
    @ExtractUserFromRequest() refreshTokenPayload: RefreshTokenPayloadDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteAllUserSessionsExpectCurrentCommand({
        userId: refreshTokenPayload.userId,
        deviceId: refreshTokenPayload.deviceId,
      }),
    );
  }

  @Delete('devices/:deviceId')
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserDeviceByDeviceId(
    @Param('deviceId') deviceId: DeviceId,
    @ExtractUserFromRequest() refreshTokenPayload: RefreshTokenPayloadDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteUserSessionByDeviceIdCommand({
        userId: refreshTokenPayload.userId,
        lastActiveDate: refreshTokenPayload.lastActiveDate,
        deviceId: deviceId,
      }),
    );
  }
}
