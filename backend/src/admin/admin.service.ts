import { Injectable } from '@nestjs/common';
import { UserQueryDto } from '../user/dto/user-query.dto';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { UserAdminDto } from '../user/dto/user-admin.dto';
import { UserService } from '../user/user.service';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async findFlaggedUsers(
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    return await this.userService.findFlaggedUsers(query);
  }

  async findBannedUsers(
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    return await this.userService.findBannedUsers(query);
  }

  async findAllManagers(
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    return await this.userService.findAllManagers(query);
  }

  async banUser(publicId: string, request: UserRequest): Promise<string> {
    return await this.userService.banUser(publicId, request);
  }

  async unbanUser(publicId: string): Promise<string> {
    return await this.userService.unbanUser(publicId);
  }

  async hardDeleteUser(publicId: string): Promise<void> {
    return await this.userService.hardDeleteUser(publicId);
  }

  async promoteManager(publicId: string): Promise<void> {
    return await this.userService.promoteManager(publicId);
  }

  async demoteManager(publicId: string): Promise<void> {
    return await this.userService.demoteManager(publicId);
  }

  async unflagUser(publicId: string): Promise<string> {
    return await this.userService.unflagUser(publicId);
  }

  async restoreUser(publicId: string): Promise<string> {
    return await this.userService.restoreUser(publicId);
  }
}
