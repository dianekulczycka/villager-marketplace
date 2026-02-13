import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserSignInRequestDto } from './dto/user-sign-in-request.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { UserPublicDto } from '../user/dto/user-public.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { user } from '@prisma/client';
import { BUYER_ICON } from '../../public/icons/icon-map';
import { TokenService } from '../security/token/token.service';
import { USER_PUBLIC_SELECT } from '../prisma/helpers/user.helpers';
import { ITokenPair } from '../shared/interfaces/token-pair.interface';
import { AUTH_ERRORS } from '../shared/errors/auth.errors';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: UserSignInRequestDto): Promise<UserPublicDto> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...registerDto,
        iconUrl: BUYER_ICON,
        password: hashedPassword,
      },
      select: USER_PUBLIC_SELECT,
    });
  }

  async login(loginDto: UserLoginRequestDto): Promise<ITokenPair> {
    const user: user = await this.validateUser(
      loginDto.email,
      loginDto.password,
    );

    return this.tokenService.issueTokenPairForUser(user.id);
  }

  async refresh(refreshToken: string): Promise<ITokenPair> {
    return this.tokenService.refreshTokenPair(refreshToken);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.blockTokenByRefreshToken(refreshToken);
  }

  private async validateUser(email: string, password: string): Promise<user> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    if (user.isDeleted || user.isBanned)
      throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_DELETED);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);

    return user;
  }
}
