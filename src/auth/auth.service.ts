import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserSignInRequestDto } from './dto/user-sign-in-request.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { ITokenPair } from './interfaces/token-pair.interface';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserPublicDto } from '../user/dto/user-public.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { user } from '@prisma/client';
import { USER_PUBLIC_SELECT } from '../user/const/orm/user';
import { TOKEN_ACTIVE_WHERE, TOKEN_BLOCK_DATA } from './const/orm/token.select';
import { AUTH_ERRORS } from './const/errors';
import { BUYER_ICON } from '../../public/icons/icon-map';
import { USER_ERRORS } from '../user/const/errors';
import { hasSwearWordsInDto } from '../shared/filters/swear-words/swear-words.filter';

@Injectable()
export class AuthService {
  private readonly accessTokenExpirationTime: number;
  private readonly refreshTokenExpirationTime: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpirationTime =
      this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') || 0;

    this.refreshTokenExpirationTime =
      this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') || 0;
  }

  async register(registerDto: UserSignInRequestDto): Promise<UserPublicDto> {
    if (hasSwearWordsInDto(registerDto)) {
      throw new ForbiddenException(USER_ERRORS.BAD_LANGUAGE);
    }

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

    const jti: string = this.generateUniqueJti();

    const payload = this.buildJwtPayload(user, jti);

    const { accessToken, refreshToken } = this.generateTokenPair(payload);
    await this.saveTokens(user.id, accessToken, refreshToken, jti);
    return { accessToken, refreshToken };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<ITokenPair> {
    try {
      const { refreshToken } = refreshTokenDto;

      this.jwtService.verify<IJwtPayload>(refreshToken);

      const tokenEntity = await this.prisma.token.findFirst({
        where: TOKEN_ACTIVE_WHERE(refreshToken),
        include: { user: true },
      });

      if (!tokenEntity || tokenEntity.refreshTokenExpirationTime < new Date())
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);

      const jti = this.generateUniqueJti();
      const payload = this.buildJwtPayload(tokenEntity.user, jti);

      const { accessToken, refreshToken: newRefreshToken } =
        this.generateTokenPair(payload);

      await this.prisma.$transaction(async (tx) => {
        await tx.token.update({
          where: { id: tokenEntity.id },
          data: TOKEN_BLOCK_DATA,
        });

        await tx.token.create({
          data: {
            accessToken,
            refreshToken: newRefreshToken,
            accessTokenExpirationTime: this.buildExpirationDate(
              this.accessTokenExpirationTime,
            ),
            refreshTokenExpirationTime: this.buildExpirationDate(
              this.refreshTokenExpirationTime,
            ),
            jti,
            user: {
              connect: { id: tokenEntity.user.id },
            },
          },
        });
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);
    }
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<void> {
    const { refreshToken } = refreshTokenDto;
    await this.prisma.token.updateMany({
      where: TOKEN_ACTIVE_WHERE(refreshToken),
      data: TOKEN_BLOCK_DATA,
    });
  }

  private async saveTokens(
    userId: number,
    accessToken: string,
    refreshToken: string,
    jti: string,
  ): Promise<void> {
    await this.prisma.token.create({
      data: {
        accessToken,
        refreshToken,
        accessTokenExpirationTime: this.buildExpirationDate(
          this.accessTokenExpirationTime,
        ),
        refreshTokenExpirationTime: this.buildExpirationDate(
          this.refreshTokenExpirationTime,
        ),
        jti,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  private async validateUser(email: string, password: string): Promise<user> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    if (user.isDeleted)
      throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_DELETED);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);

    return user;
  }

  private generateUniqueJti(): string {
    return Math.random().toString(36).substring(2);
  }

  private generateTokenPair(payload: IJwtPayload): ITokenPair {
    const accessToken: string = this.jwtService.sign(payload, {
      expiresIn: `${this.accessTokenExpirationTime}s`,
    });

    const refreshToken: string = this.jwtService.sign(payload, {
      expiresIn: `${this.refreshTokenExpirationTime}s`,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async issueTokenPairForUser(userId: number): Promise<ITokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    const jti = this.generateUniqueJti();

    const payload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      jti,
    };

    const tokens = this.generateTokenPair(payload);

    await this.saveTokens(
      user.id,
      tokens.accessToken,
      tokens.refreshToken,
      jti,
    );

    return tokens;
  }

  async blockTokensForUser(userId: number): Promise<void> {
    await this.prisma.token.updateMany({
      where: {
        userId,
        isBlocked: 0,
      },
      data: TOKEN_BLOCK_DATA,
    });
  }

  private buildExpirationDate(seconds: number): Date {
    return new Date(Date.now() + seconds * 1000);
  }

  private buildJwtPayload(user: user, jti: string): IJwtPayload {
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      jti,
    };
  }
}
