import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret: string = configService.get<string>('JWT_SECRET') || '';
    if (!jwtSecret) throw new Error('JWT_SECRET is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const cookies = req.cookies as Record<string, string> | undefined;
          return cookies?.accessToken ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const tokenEntity = await this.prisma.token.findUnique({
      where: {
        jti: payload.jti,
        isBlocked: 0,
      },
      select: {
        id: true,
      },
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Token is blocked or invalid');
    }

    return payload;
  }
}
