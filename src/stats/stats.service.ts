import { Injectable } from '@nestjs/common';
import { IUserRequest } from '../user/interfaces/user-request.interface';
import { user_role } from '@prisma/client';
import {
  ADMIN_BANNED_USERS_WHERE,
  ADMIN_FLAGGED_USERS_WHERE,
} from '../user/const/orm/user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileStats(request: IUserRequest) {
    const { userId, role } = request.user;
    if (role === user_role.SELLER) {
      const [totalItems, activeItems, viewsAgg, mostViewedItem] =
        await this.prisma.$transaction([
          this.prisma.item.count({
            where: { sellerId: userId },
          }),

          this.prisma.item.count({
            where: { sellerId: userId, isDeleted: 0 },
          }),

          this.prisma.item.aggregate({
            where: { sellerId: userId },
            _sum: { views: true },
          }),

          this.prisma.item.findFirst({
            where: { sellerId: userId },
            orderBy: { views: 'desc' },
            select: {
              id: true,
              name: true,
              views: true,
            },
          }),
        ]);

      return {
        totalItems,
        activeItems,
        totalViews: viewsAgg._sum.views ?? 0,
        mostViewedItem,
      };
    }

    if (role === user_role.ADMIN || role === user_role.MANAGER) {
      const [totalUsers, totalSellers, totalFlagged, totalBanned, totalItems] =
        await this.prisma.$transaction([
          this.prisma.user.count({
            where: { isDeleted: 0 },
          }),

          this.prisma.user.count({
            where: { role: user_role.SELLER, isDeleted: 0 },
          }),

          this.prisma.user.count({
            where: ADMIN_FLAGGED_USERS_WHERE,
          }),

          this.prisma.user.count({
            where: ADMIN_BANNED_USERS_WHERE,
          }),

          this.prisma.item.count({
            where: { isDeleted: 0 },
          }),
        ]);

      return {
        totalUsers,
        totalSellers,
        totalFlagged,
        totalBanned,
        totalItems,
      };
    }
    return {
      totalItems: 0,
    };
  }
}
