import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokenService } from '../../security/token/token.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    const cookieHeader = client.handshake.headers.cookie;

    if (!cookieHeader) throw new WsException('Unauthorized');

    const accessToken = this.extractAccessToken(cookieHeader);

    if (!accessToken) throw new WsException('Unauthorized');

    try {
      client.data = await this.tokenService.validateAccessToken(accessToken);

      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }

  private extractAccessToken(cookieHeader: string): string | null {
    const cookies = cookieHeader.split(';');

    const accessTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('accessToken='),
    );

    if (!accessTokenCookie) return null;

    return accessTokenCookie.trim().slice('accessToken='.length);
  }
}
