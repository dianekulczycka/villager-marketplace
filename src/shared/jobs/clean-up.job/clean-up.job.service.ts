import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CleanJobs {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/30 * * * *')
  async cleanExpiredTokens() {
    await this.prisma.token.deleteMany({
      where: {
        refreshTokenExpirationTime: {
          lt: new Date(),
        },
      },
    });
  }

  @Cron('0 3 * * *')
  async cleanSoftDeletedItems() {
    const limitDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await this.prisma.item.deleteMany({
      where: {
        isDeleted: 1,
        updatedAt: { lt: limitDate },
      },
    });
  }

  @Cron('0 4 * * *')
  async cleanSoftDeletedUsers() {
    const limitDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.prisma.user.deleteMany({
      where: {
        isDeleted: 1,
        deletedAt: { lt: limitDate },
      },
    });
  }
}
