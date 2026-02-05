import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { UserSignInRequestDto } from './dto/user-sign-in-request.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { UserPublicDto } from '../user/dto/user-public.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: UserSignInRequestDto,
  ): Promise<UserPublicDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: UserLoginRequestDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.authService.accessTokenExpirationTime * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.authService.refreshTokenExpirationTime * 1000,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    const refreshToken: string = req.cookies.refreshToken as string;
    const tokens = await this.authService.refresh(refreshToken);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.authService.accessTokenExpirationTime * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.authService.refreshTokenExpirationTime * 1000,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    const refreshToken: string = req.cookies.refreshToken as string;
    await this.authService.logout(refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }
}
