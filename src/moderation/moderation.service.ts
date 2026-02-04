import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { USER_BAN_DATA } from '../user/const/orm/user';
import {
  AccountRecoveryRequestDto,
  AccountRecoveryRequestEnum,
} from '../user/dto/account-recovery-request.dto';
import { USER_ERRORS } from '../user/const/errors';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  async flagUser(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isFlagged: true, email: true },
    });

    if (!user) return;

    if (user.isFlagged === 1) {
      await this.prisma.user.update({
        where: { id: userId },
        data: USER_BAN_DATA(user.email),
      });

      await this.authService.blockTokensForUser(userId);
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isFlagged: 1 },
    });

    await this.authService.blockTokensForUser(userId);
    this.mailService.notifyManagersAboutFlaggedUser(userId);
  }

  async requestRecovery(
    accountRecoveryRequestDto: AccountRecoveryRequestDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: accountRecoveryRequestDto.email },
      select: { id: true, email: true, isBanned: true, isDeleted: true },
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    switch (accountRecoveryRequestDto.actionType) {
      case AccountRecoveryRequestEnum.UNBAN:
        if (!user.isBanned)
          throw new BadRequestException(USER_ERRORS.USER_NOT_BANNED);

        this.mailService.notifyManagersAboutRecoveryRequest(
          accountRecoveryRequestDto,
        );
        break;

      case AccountRecoveryRequestEnum.UNDELETE:
        if (!user.isDeleted)
          throw new BadRequestException(USER_ERRORS.USER_NOT_DELETED);

        this.mailService.notifyManagersAboutRecoveryRequest(
          accountRecoveryRequestDto,
        );
        break;

      default:
        throw new BadRequestException(USER_ERRORS.NOT_ALLOWED_UPDATE);
    }
  }
}
