import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { UserSignInRequestDto } from './dto/user-sign-in-request.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { UserPublicDto } from '../user/dto/user-public.dto';
import { AuthGuard } from '@nestjs/passport';
import { AccountRecoveryRequestDto } from '../user/dto/account-recovery-request.dto';
import { ModerationService } from '../moderation/moderation.service';
import { MailService } from '../mail/mail.service';
import { ModerationInterceptor } from '../moderation/moderation.interceptor.service';
import { ModerationPipe } from '../moderation/moderation.pipe.service';
import { TokenService } from '../security/token/token.service';
import { ApiErrorResponses } from '../shared/filters/dto/api-error-response.decorator';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@ApiErrorResponses()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly moderationService: ModerationService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UsePipes(new ModerationPipe(['username']))
  @UseInterceptors(ModerationInterceptor)
  @Post('register')
  async register(
    @Body() registerDto: UserSignInRequestDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<UserPublicDto> {
    const user = await this.authService.register(registerDto);
    const { email, password } = registerDto;
    const { accessToken, refreshToken } = await this.authService.login({
      email,
      password,
    });
    this.tokenService.setAuthCookies(res, accessToken, refreshToken);
    return user;
  }

  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @HttpCode(201)
  @Post('login')
  async login(
    @Body() loginDto: UserLoginRequestDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);
    this.tokenService.setAuthCookies(res, accessToken, refreshToken);
  }

  @SkipThrottle()
  @HttpCode(204)
  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    const oldRefreshToken: string = req.cookies.refreshToken as string;
    const { accessToken, refreshToken } =
      await this.authService.refresh(oldRefreshToken);

    this.tokenService.setAuthCookies(res, accessToken, refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    const refreshToken: string = req.cookies.refreshToken as string;
    await this.authService.logout(refreshToken);
    this.tokenService.clearAuthCookies(res);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(204)
  @Post('account-recovery')
  async requestRecovery(
    @Body() accountRecoveryRequestDto: AccountRecoveryRequestDto,
  ): Promise<void> {
    const data = await this.moderationService.requestRecovery(
      accountRecoveryRequestDto,
    );
    await this.mailService.sendRecoveryRequest(data);
  }
}
