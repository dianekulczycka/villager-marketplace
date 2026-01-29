import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserSignInRequestDto } from './dto/user-sign-in-request.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { ITokenPair } from './interfaces/token-pair.interface';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserPublicDto } from '../user/dto/user-public.dto';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { user } from '@prisma/client';

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
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user: user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
    });

    return plainToInstance(UserPublicDto, user);
  }

  async login(loginDto: UserLoginRequestDto): Promise<ITokenPair> {
    const user: user = await this.validateUser(
      loginDto.email,
      loginDto.password,
    );

    const jti: string = this.generateUniqueJti();

    const payload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      jti,
    };

    const { accessToken, refreshToken } = this.generateTokenPair(payload);
    await this.saveTokens(user.id, accessToken, refreshToken, jti);
    return { accessToken, refreshToken };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<ITokenPair> {
    try {
      const { refreshToken } = refreshTokenDto;

      this.jwtService.verify<IJwtPayload>(refreshToken);

      const tokenEntity = await this.prisma.token.findFirst({
        where: {
          refreshToken,
          isBlocked: 0,
        },
        include: {
          user: true,
        },
      });

      if (!tokenEntity || tokenEntity.refreshTokenExpirationTime < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      await this.prisma.token.update({
        where: { id: tokenEntity.id },
        data: { isBlocked: 1 },
      });

      const jti: string = this.generateUniqueJti();

      const payload: IJwtPayload = {
        userId: tokenEntity.user.id,
        email: tokenEntity.user.email,
        jti,
      };

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        this.generateTokenPair(payload);

      await this.saveTokens(
        tokenEntity.user.id,
        newAccessToken,
        newRefreshToken,
        jti,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<void> {
    const { refreshToken } = refreshTokenDto;

    await this.prisma.token.updateMany({
      where: {
        refreshToken,
        isBlocked: 0,
      },
      data: {
        isBlocked: 1,
      },
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
        accessTokenExpirationTime: new Date(
          Date.now() + this.accessTokenExpirationTime * 1000,
        ),
        refreshTokenExpirationTime: new Date(
          Date.now() + this.refreshTokenExpirationTime * 1000,
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

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
}
