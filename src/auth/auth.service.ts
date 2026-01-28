import { InjectRepository } from '@nestjs/typeorm';

import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserSignInRequestDto } from './dto/user-sign-in-request.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { ITokenPair } from './interfaces/token-pair.interface';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../user/entities/user.entity';
import { UserPublicDto } from '../user/dto/user-public.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  private readonly accessTokenExpirationTime: number;
  private readonly refreshTokenExpirationTime: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpirationTime =
      this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') || 0;

    this.refreshTokenExpirationTime =
      this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') || 0;
  }

  async register(registerDto: UserSignInRequestDto): Promise<UserPublicDto> {
    const user: User = this.userRepository.create(registerDto);
    await this.userRepository.save(user);
    return plainToInstance(UserPublicDto, user);
  }

  async login(loginDto: UserLoginRequestDto): Promise<ITokenPair> {
    const user: User = await this.validateUser(
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
    await this.saveTokens(user, accessToken, refreshToken, jti);
    return { accessToken, refreshToken };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<ITokenPair> {
    try {
      const refreshToken = refreshTokenDto.refreshToken;

      this.jwtService.verify<IJwtPayload>(refreshToken);
      const tokenEntity = await this.tokenRepository.findOne({
        where: { refreshToken, isBlocked: false },
        relations: ['user'],
      });

      if (!tokenEntity || tokenEntity.refreshTokenExpirationTime < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      tokenEntity.isBlocked = true;
      await this.tokenRepository.save(tokenEntity);

      const jti: string = this.generateUniqueJti();
      const payload: IJwtPayload = {
        userId: tokenEntity.user.id,
        email: tokenEntity.user.email,
        jti,
      };

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        this.generateTokenPair(payload);

      await this.saveTokens(
        tokenEntity.user,
        newAccessToken,
        newRefreshToken,
        jti,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      throw new UnauthorizedException(`Invalid or expired token`);
    }
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<void> {
    const { refreshToken } = refreshTokenDto;
    const tokenEntity: Token | null = await this.tokenRepository.findOne({
      where: { refreshToken, isBlocked: false },
    });
    if (tokenEntity) {
      tokenEntity.isBlocked = true;
      await this.tokenRepository.save(tokenEntity);
    }
  }

  private async saveTokens(
    user: User,
    accessToken: string,
    refreshToken: string,
    jti: string,
  ): Promise<void> {
    const tokenEntity: Token = this.tokenRepository.create({
      accessToken,
      refreshToken,
      accessTokenExpirationTime: new Date(
        Date.now() + this.accessTokenExpirationTime * 1000,
      ),
      refreshTokenExpirationTime: new Date(
        Date.now() + this.refreshTokenExpirationTime * 1000,
      ),
      user,
      jti,
    });
    await this.tokenRepository.save(tokenEntity);
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user: User | null = await this.userRepository.findOneBy({ email });
    if (!user || !(await user.validatePassword(password))) {
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
