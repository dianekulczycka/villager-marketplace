import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountRecoveryRequestDto } from '../auth/dto/account-recovery-request.dto';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async requestRecovery(
    dto: AccountRecoveryRequestDto,
  ): Promise<AccountRecoveryRequestDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true },
    });

    if (!user) return null;
    return dto;
  }
}
