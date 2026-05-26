import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { hasSwearWords } from '../shared/filters/swear-words.filter';
import { TokenService } from '../security/token/token.service';
import { USER_ERRORS } from '../shared/errors/user.errors';

@Injectable()
export class ModerationInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest<Request & UserRequest>();
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
          isBanned: 1,
          bannedBy: user.email,
          bannedAt: new Date(),
        },
      });

      await this.tokenService.blockTokensForUser(userId);
      await this.mailService.notifyManagersBanned(userId, user.email);
      await this.mailService.notifyUserBanned(user.email);

      throw new ForbiddenException(USER_ERRORS.BANNED);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isFlagged: 1 },
    });

    await this.tokenService.blockTokensForUser(userId);
    await this.mailService.notifyManagersFlagged(userId, user.email);
    await this.mailService.notifyUserFlagged(user.email);

    throw new ForbiddenException(USER_ERRORS.FLAGGED);
  }
}
