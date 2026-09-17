import { Injectable } from '@nestjs/common';
import { UserQueryDto } from '../user/dto/user-query.dto';
import { UserRequest } from '../user/interfaces/user-request.interface';
import { UserAdminDto } from '../user/dto/user-admin.dto';
import { UserService } from '../user/user.service';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';
import { UserAdminListEnum } from '../user/enums/user-admin-list.enum';
import { ConfirmPasswordDto } from '../shared/dto/confirm-password.dto';

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async findFlaggedUsers(
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    return await this.userService.findUsersAdmin(
      query,
      UserAdminListEnum.FLAGGED,
    );
  }

  async findBannedUsers(
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    return await this.userService.findUsersAdmin(
      query,
      UserAdminListEnum.BANNED,
    );
  }

  async findAllManagers(
    query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    return await this.userService.findUsersAdmin(
      query,
      UserAdminListEnum.MANAGERS,
    );
  }

  async banUser(publicId: string, request: UserRequest): Promise<string> {
    return await this.userService.banUser(publicId, request);
  }

  async unbanUser(publicId: string): Promise<string> {
    return await this.userService.unbanUser(publicId);
  }

  async hardDeleteUser(
    request: UserRequest,
    publicId: string,
    confirmPasswordDto: ConfirmPasswordDto,
  ): Promise<void> {
    return await this.userService.hardDeleteUser(
      request,
      publicId,
      confirmPasswordDto,
    );
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
