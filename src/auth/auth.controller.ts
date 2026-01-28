import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignInRequestDto } from './dto/user-sign-in-request.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { ITokenPair } from './interfaces/token-pair.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserPublicDto } from '../user/dto/user-public.dto';

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
  async login(@Body() loginDto: UserLoginRequestDto): Promise<ITokenPair> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<ITokenPair> {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    return this.authService.logout(refreshTokenDto);
  }
}
