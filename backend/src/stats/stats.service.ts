import { Injectable } from '@nestjs/common';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { user_role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileStats } from './interfaces/stats.interface';
import {
  ADMIN_BANNED_USERS_WHERE,
  ADMIN_FLAGGED_USERS_WHERE,
} from '../prisma/helpers/user.helpers';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileStats(request: UserRequest): Promise<ProfileStats> {
    const { userId, role } = request.user;

    if (role === user_role.BUYER) {
      return {
        role: user_role.BUYER,
        totalItems: 0,
      };
    }

    if (role === user_role.SELLER) {
      const [totalItems, activeItems, viewsAgg, mostViewedItem] =
        await this.prisma.$transaction([
          this.prisma.item.count({ where: { sellerId: userId, isDeleted: 0 } }),
          this.prisma.item.count({ where: { sellerId: userId, isDeleted: 0 } }),
          this.prisma.item.aggregate({
            where: { sellerId: userId, isDeleted: 0 },
            _sum: { views: true },
          }),
          this.prisma.item.findFirst({
            where: { sellerId: userId, isDeleted: 0 },
            orderBy: { views: 'desc' },
            select: { id: true, name: true, views: true },
          }),
        ]);

      return {
        role: user_role.SELLER,
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
            where: {
              role: {
                in: [user_role.SELLER, user_role.BUYER],
              },
              isDeleted: 0,
            },
          }),
          this.prisma.user.count({
            where: { role: user_role.SELLER, isDeleted: 0 },
          }),
          this.prisma.user.count({ where: ADMIN_FLAGGED_USERS_WHERE }),
          this.prisma.user.count({ where: ADMIN_BANNED_USERS_WHERE }),
          this.prisma.item.count({ where: { isDeleted: 0 } }),
        ]);

      return {
        role,
        totalUsers,
        totalSellers,
        totalFlagged,
        totalBanned,
        totalItems,
      };
    }

    throw new Error();
  }
}
