import { Injectable } from '@nestjs/common';
import { UserQueryDto } from '../user/dto/user-query.dto';
import { IUserRequest } from '../user/interfaces/user-request.interface';
import { UserAdminDto } from '../user/dto/user-admin.dto';
import { UserService } from '../user/user.service';
import { IPaginatedResponse } from '../shared/pagination/pagination-response.interface';

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async findAllUsers(
    query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return await this.userService.findAllUsers(query);
  }

  async findFlaggedUsers(
    query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return await this.userService.findFlaggedUsers(query);
  }

  async findBannedUsers(
    query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return await this.userService.findBannedUsers(query);
  }

  async findAllManagers(
    query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return await this.userService.findAllManagers(query);
  }

  async banUser(userId: number, request: IUserRequest): Promise<void> {
    return await this.userService.banUser(userId, request);
  }

  async unbanUser(userId: number): Promise<void> {
    return await this.userService.unbanUser(userId);
  }

  async hardDeleteUser(userId: number): Promise<void> {
    return await this.userService.hardDeleteUser(userId);
  }

  async promoteManager(userId: number): Promise<void> {
    return await this.userService.promoteManager(userId);
  }

  async demoteManager(userId: number): Promise<void> {
    return await this.userService.demoteManager(userId);
  }

  async unflagUser(userId: number): Promise<void> {
    await this.userService.unflagUser(userId);
  }

  async restoreUser(userId: number): Promise<void> {
    await this.userService.restoreUser(userId);
  }
}
