import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { user } from '@prisma/client';
import express from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenPair } from '../../shared/interfaces/token-pair.interface';
import { USER_ERRORS } from '../../shared/errors/user.errors';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import {
  TOKEN_ACTIVE_WHERE,
  TOKEN_BLOCK_DATA,
} from '../../prisma/helpers/token.helpers';
import { AUTH_ERRORS } from '../../shared/errors/auth.errors';

@Injectable()
export class TokenService {
  public readonly accessTokenExpirationTime: number;
  public readonly refreshTokenExpirationTime: number;

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

  async issueTokenPairForUser(userId: number): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    const jti = this.generateUniqueJti();
    const payload: JwtPayload = {
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

  async refreshTokenPair(refreshToken: string): Promise<TokenPair> {
    try {
      this.jwtService.verify<JwtPayload>(refreshToken);

      const tokenEntity = await this.prisma.token.findFirst({
        where: TOKEN_ACTIVE_WHERE(refreshToken),
        include: { user: true },
      });

      if (!tokenEntity || tokenEntity.refreshTokenExpirationTime < new Date())
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);

      const jti = this.generateUniqueJti();
      const payload = this.buildJwtPayload(tokenEntity.user, jti);
      const tokens = this.generateTokenPair(payload);

      await this.prisma.$transaction(async (tx) => {
        await tx.token.update({
          where: { id: tokenEntity.id },
          data: TOKEN_BLOCK_DATA,
        });

        await tx.token.create({
          data: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
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

      return tokens;
    } catch {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);
    }
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

  async blockTokenByRefreshToken(refreshToken: string): Promise<void> {
    await this.prisma.token.updateMany({
      where: TOKEN_ACTIVE_WHERE(refreshToken),
      data: TOKEN_BLOCK_DATA,
    });
  }

  setAuthCookies(res: express.Response, access: string, refresh: string) {
    res.cookie('accessToken', access, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.accessTokenExpirationTime * 1000,
    });

    res.cookie('refreshToken', refresh, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.refreshTokenExpirationTime * 1000,
    });
  }

  clearAuthCookies(res: express.Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  private generateTokenPair(payload: JwtPayload): TokenPair {
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

  private generateUniqueJti(): string {
    return Math.random().toString(36).substring(2);
  }

  private buildExpirationDate(seconds: number): Date {
    return new Date(Date.now() + seconds * 1000);
  }

  private buildJwtPayload(user: user, jti: string): JwtPayload {
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      jti,
    };
  }
}
