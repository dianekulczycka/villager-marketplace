import { Injectable } from '@nestjs/common';
import { ItemService } from '../items/item.service';
import { UserService } from '../user/user.service';

import { BecomeSellerRequestDto } from '../user/dto/become-seller-request';
import { UserQueryDto } from '../user/dto/user-query.dto';
import { IUserRequest } from '../user/interfaces/user-request.interface';
import { UserRoleEnum } from '../user/const/enums/user-role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { USER_SOFT_DELETE_DATA } from '../user/const/orm/user';
import { UserAdminDto } from '../user/dto/user-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly itemService: ItemService,
    private readonly prisma: PrismaService,
  ) {}

  async findAllUsers(query: UserQueryDto) {
    return this.userService.findAllAdmin(query);
  }

  async findFlaggedUsers(query: UserQueryDto) {
    return this.userService.findAllFlagged(query);
  }

  async findAllManagers(): Promise<UserAdminDto[]> {
    return this.userService.findAllManagers();
  }

  async banUser(userId: number, request: IUserRequest) {
    const adminEmail = request.user.email;
    return this.userService.banUser(userId, adminEmail);
  }

  async unbanUser(userId: number) {
    return this.userService.unbanUser(userId);
  }

  async softDeleteUser(userId: number, request: IUserRequest): Promise<void> {
    const adminEmail = request.user.email;

    await this.prisma.$transaction([
      this.prisma.item.updateMany({
        where: { sellerId: userId },
        data: { isDeleted: 1 },
      }),

      this.prisma.user.update({
        where: { id: userId },
        data: USER_SOFT_DELETE_DATA(adminEmail),
      }),
    ]);
  }

  async hardDeleteUser(userId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.item.deleteMany({
        where: { sellerId: userId },
      }),
      this.prisma.user.delete({
        where: { id: userId },
      }),
    ]);
  }

  async promoteManager(userId: number) {
    return this.userService.changeUserRole(userId, UserRoleEnum.MANAGER);
  }

  async demoteManager(userId: number) {
    return this.userService.changeUserRole(userId, UserRoleEnum.BUYER);
  }

  async makeUserSeller(
    userId: number,
    becomeSellerRequestDto: BecomeSellerRequestDto,
  ) {
    await this.itemService.softDeleteItemsOfUser(userId);

    return this.userService.makeUserSellerByAdmin(
      userId,
      becomeSellerRequestDto.sellerType,
    );
  }
}
