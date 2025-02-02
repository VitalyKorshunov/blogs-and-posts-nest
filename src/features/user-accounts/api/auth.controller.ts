import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { UsersService } from '../application/users.service';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { ExtractUserFromRequest } from '../guards/decorators/extract-user-from-request.decorator';
import { UserContextDTO } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/users.view-dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { LoginSuccessDTO, LoginSuccessViewDTO } from './view-dto/auth.view-dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import {
  ChangeUserPasswordInputDTO,
  ConfirmationCodeInputDTO,
  CreateUserInputDTO,
  EmailResendingInputDTO,
  PasswordRecoveryInputDTO,
} from './input-dto/users.input-dto';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { RegistrationUserCommand } from '../application/use-cases/registration-user.use-case';
import { ConfirmUserEmailCommand } from '../application/use-cases/confirm-user-email.use-case';
import { ResendUserConfirmationEmailCommand } from '../application/use-cases/resend-user-confirmation-email.use-case';
import { SendUserRecoveryPasswordCommand } from '../application/use-cases/send-user-recovery-password.use-case';
import { ChangeUserPasswordCommand } from '../application/use-cases/change-user-password.use-case';
import { Response } from 'express';

@Controller('auth')
export class AuthControllers {
  constructor(
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

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
  ): Promise<LoginSuccessViewDTO> {
    const tokens: LoginSuccessDTO = await this.commandBus.execute(
      new LoginUserCommand(user.userId),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      secure: true,
      httpOnly: true,
    });

    return { accessToken: tokens.accessToken };
  }

  // async logoutUser(req: Request, res: Response) {
  //   const result = await this.authService.logoutUser(req.cookies.refreshToken);
  //
  //   if (result.statusCode === StatusCode.Success) {
  //     res.sendStatus(204);
  //   } else {
  //     handleError(result, res);
  //   }
  // }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getUserInfo(
    @ExtractUserFromRequest() user: UserContextDTO,
  ): Promise<MeViewDto> {
    return await this.authQueryRepository.getMeInfo(user.userId);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationUser(@Body() dto: CreateUserInputDTO): Promise<void> {
    await this.commandBus.execute(new RegistrationUserCommand(dto));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmUserEmail(@Body() dto: ConfirmationCodeInputDTO): Promise<void> {
    await this.commandBus.execute(new ConfirmUserEmailCommand(dto));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail(
    @Body() dto: EmailResendingInputDTO,
  ): Promise<void> {
    await this.commandBus.execute(new ResendUserConfirmationEmailCommand(dto));
  }

  //
  // async updateTokens(req: Request, res: Response) {
  //   const { refreshToken } = req.cookies;
  //
  //   const result = await this.authService.updateTokens(refreshToken);
  //
  //   if (result.statusCode === StatusCode.Success) {
  //     const { accessToken, refreshToken }: AuthTokensType = result.data;
  //
  //     res.cookie('refreshToken', refreshToken, {
  //       httpOnly: true,
  //       secure: true,
  //     });
  //     res.status(200).json({ accessToken: accessToken });
  //   } else {
  //     handleError(result, res);
  //   }
  // }

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
}
