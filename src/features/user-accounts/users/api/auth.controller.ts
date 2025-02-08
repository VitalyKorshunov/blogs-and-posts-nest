import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { ExtractUserFromRequest } from '../guards/decorators/extract-user-from-request.decorator';
import { UserContextDTO } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/users.view-dto';
import { AccessTokenAuthGuard } from '../guards/bearer/access-token.guard';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { AccessTokenViewDTO, LoginSuccessDTO } from './view-dto/auth.view-dto';
import { ApiBearerAuth, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import {
  ChangeUserPasswordInputDTO,
  ConfirmationCodeInputDTO,
  CreateUserInputDTO,
  EmailResendingInputDTO,
  PasswordRecoveryInputDTO,
} from './input-dto/users.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { RegistrationUserCommand } from '../application/use-cases/registration-user.use-case';
import { ConfirmUserEmailCommand } from '../application/use-cases/confirm-user-email.use-case';
import { ResendUserConfirmationEmailCommand } from '../application/use-cases/resend-user-confirmation-email.use-case';
import { SendUserRecoveryPasswordCommand } from '../application/use-cases/send-user-recovery-password.use-case';
import { ChangeUserPasswordCommand } from '../application/use-cases/change-user-password.use-case';
import { Response } from 'express';
import { RefreshTokenPayloadDTO } from '../guards/dto/tokens.dto';
import { RefreshTokenAuthGuard } from '../guards/cookie/refresh-token.guard';
import { CreateSessionCommand } from '../../security/application/use-cases/create-session.use-case';
import { DeleteUserSessionByDeviceIdCommand } from '../../security/application/use-cases/delete-user-session-by-device-id.use-case';
import { UpdateTokensCommand } from '../application/use-cases/update-tokens.use-case';
import { UpdateUserSessionCommand } from '../../security/application/use-cases/update-user-session.use-case';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthControllers {
  constructor(
    private authQueryRepository: AuthQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendUserRecoveryPassword(
    @Body() dto: PasswordRecoveryInputDTO,
  ): Promise<void> {
    await this.commandBus.execute(new SendUserRecoveryPasswordCommand(dto));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeUserPassword(
    @Body() dto: ChangeUserPasswordInputDTO,
  ): Promise<void> {
    await this.commandBus.execute(new ChangeUserPasswordCommand(dto));
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOrEmail: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword123' },
      },
    },
  })
  async loginUser(
    @ExtractUserFromRequest() user: UserContextDTO,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
  ): Promise<AccessTokenViewDTO> {
    const tokens: LoginSuccessDTO = await this.commandBus.execute(
      new LoginUserCommand({ userId: user.userId }),
    );

    await this.commandBus.execute(
      new CreateSessionCommand({
        refreshToken: tokens.refreshToken,
        deviceName: userAgent ?? 'Not defined',
        ip: ip,
      }),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      secure: true,
      httpOnly: true,
    });

    return { accessToken: tokens.accessToken };
  }

  @SkipThrottle()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @UseGuards(RefreshTokenAuthGuard)
  async updateTokens(
    @Res({ passthrough: true }) res: Response,
    @ExtractUserFromRequest() refreshTokenPayload: RefreshTokenPayloadDTO,
  ): Promise<AccessTokenViewDTO> {
    const tokens = await this.commandBus.execute(
      new UpdateTokensCommand({
        deviceId: refreshTokenPayload.deviceId,
        userId: refreshTokenPayload.userId,
      }),
    );

    await this.commandBus.execute(
      new UpdateUserSessionCommand({
        refreshToken: tokens.refreshToken,
      }),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmUserEmail(@Body() dto: ConfirmationCodeInputDTO): Promise<void> {
    await this.commandBus.execute(new ConfirmUserEmailCommand(dto));
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationUser(@Body() dto: CreateUserInputDTO): Promise<void> {
    await this.commandBus.execute(new RegistrationUserCommand(dto));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail(
    @Body() dto: EmailResendingInputDTO,
  ): Promise<void> {
    await this.commandBus.execute(new ResendUserConfirmationEmailCommand(dto));
  }

  @SkipThrottle()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenAuthGuard)
  async logoutUser(
    @ExtractUserFromRequest() refreshTokenPayload: RefreshTokenPayloadDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteUserSessionByDeviceIdCommand({
        userId: refreshTokenPayload.userId,
        lastActiveDate: refreshTokenPayload.lastActiveDate,
        deviceId: refreshTokenPayload.deviceId,
      }),
    );
  }

  @SkipThrottle()
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AccessTokenAuthGuard)
  async getUserInfo(
    @ExtractUserFromRequest() user: UserContextDTO,
  ): Promise<MeViewDto> {
    return await this.authQueryRepository.getMeInfo(user.userId);
  }
}
