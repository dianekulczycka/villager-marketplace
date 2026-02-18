import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AccountRecoveryRequestDto,
  AccountRecoveryRequestEnum,
} from '../user/dto/account-recovery-request.dto';
import { USER_ERRORS } from '../shared/errors/user.errors';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async requestRecovery(
    accountRecoveryRequestDto: AccountRecoveryRequestDto,
  ): Promise<AccountRecoveryRequestDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: accountRecoveryRequestDto.email },
      select: { id: true, email: true, isBanned: true, isDeleted: true },
    });

    if (!user) throw new NotFoundException(USER_ERRORS.NOT_FOUND);

    switch (accountRecoveryRequestDto.actionType) {
      case AccountRecoveryRequestEnum.UNBAN:
        if (!user.isBanned)
          throw new BadRequestException(USER_ERRORS.NOT_BANNED);
        break;

      case AccountRecoveryRequestEnum.UNDELETE:
        if (!user.isDeleted)
          throw new BadRequestException(USER_ERRORS.NOT_DELETED);
        break;
    }

    return accountRecoveryRequestDto;
  }
}
