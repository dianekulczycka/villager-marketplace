import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { IUserRequest } from '../user/interfaces/user-request.interface';
import { hasSwearWords } from '../shared/filters/swear-words.filter';
import { TokenService } from '../security/token/token.service';

@Injectable()
export class ModerationInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest<Request & IUserRequest>();
    const userId = req.user?.userId;

    if (!userId) return next.handle();

    const body = req.body as unknown as Record<string, unknown>;
    if (!body) return next.handle();

    const texts = Object.values(body).filter(
      (v): v is string => typeof v === 'string',
    );

    const hasSwears = texts.some((t) => hasSwearWords(t));
    if (!hasSwears) return next.handle();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isFlagged: true, email: true },
    });

    if (!user) return next.handle();

    if (user.isFlagged === 1) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isFlagged: 1,
          isBanned: 1,
          bannedBy: user.email,
          bannedAt: new Date(),
        },
      });

      await this.tokenService.blockTokensForUser(userId);
      await this.mailService.notifyManagersBanned(userId);
      await this.mailService.notifyUserBanned(userId);
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isFlagged: 1 },
      });

      await this.tokenService.blockTokensForUser(userId);
      await this.mailService.notifyManagersFlagged(userId);
      await this.mailService.notifyUserFlagged(userId);
    }

    return next.handle();
  }
}
