import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { UsersService } from '../application/users.service';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { ExtractUserFromRequest } from '../guards/decorators/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/users.view-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { LoginSuccessViewDTO } from './view-dto/auth.view-dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import {
  ConfirmationCodeInputDTO,
  CreateUserInputDTO,
  EmailResendingInputDTO,
  NewPasswordInputDTO,
  PasswordRecoveryInputDTO,
} from './input-dto/users.input-dto';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';

@Controller('auth')
export class AuthControllers {
  constructor(
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
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
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<LoginSuccessViewDTO> {
    return await this.authService.loginUser(user.userId);
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
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<MeViewDto> {
    return await this.authQueryRepository.getMeInfo(user.userId);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationUser(
    @Body() createUserInputDTO: CreateUserInputDTO,
  ): Promise<void> {
    await this.authService.registrationUser(createUserInputDTO);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmationEmail(
    @Body() confirmationCodeInputDTO: ConfirmationCodeInputDTO,
  ): Promise<void> {
    await this.authService.registrationConfirmationEmail(
      confirmationCodeInputDTO,
    );
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(
    @Body() emailResendingInputDTO: EmailResendingInputDTO,
  ): Promise<void> {
    await this.authService.resendRegistrationEmail(emailResendingInputDTO);
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
  async passwordRecovery(
    @Body() passwordRecoveryInputDTO: PasswordRecoveryInputDTO,
  ): Promise<void> {
    await this.authService.passwordRecovery(passwordRecoveryInputDTO);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() newPasswordInputDTO: NewPasswordInputDTO,
  ): Promise<void> {
    await this.authService.newPassword(newPasswordInputDTO);
  }
}
