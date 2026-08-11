import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { TokenService } from '../../security/token/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
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
    await this.tokenService.validateTokenJti(payload.jti);
    return payload;
  }
}
