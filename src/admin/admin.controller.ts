import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { UserQueryDto } from '../user/dto/user-query.dto';
import { IPaginatedResponse } from '../shared/pagination/pagination-response.interface';
import * as userRequestInterface from '../user/interfaces/user-request.interface';
import { UserAdminDto } from '../user/dto/user-admin.dto';
import { AllowedRolesGuard } from '../auth/guards/role.guards';
import { user_role } from '@prisma/client';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UserService } from '../user/user.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Get('users')
  async getAllUsers(
    @Query() query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return this.adminService.findAllUsers(query);
  }

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Get('users/flagged')
  async getFlaggedUsers(
    @Query() query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return this.adminService.findFlaggedUsers(query);
  }

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Get('users/banned')
  async getBannedUsers(
    @Query() query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return this.adminService.findBannedUsers(query);
  }

  @UseGuards(AuthGuard('jwt'), new AllowedRolesGuard([user_role.ADMIN]))
  @Get('managers')
  findAllManagers(@Query() query: UserQueryDto) {
    return this.adminService.findAllManagers(query);
  }

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Patch('users/:id')
  updateUserByAdmin(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(request, Number(id), updateUserDto);
  }

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Patch('users/:id/soft-delete')
  async softDeleteUserByAdmin(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
  ): Promise<void> {
    return this.userService.softDelete(request, Number(id));
  }

  @UseGuards(AuthGuard('jwt'), new AllowedRolesGuard([user_role.ADMIN]))
  @Delete('users/:id')
  hardDeleteUser(@Param('id') id: string) {
    return this.adminService.hardDeleteUser(Number(id));
  }

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Patch('users/:id/ban')
  async banUser(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
  ) {
    return await this.adminService.banUser(Number(id), request);
  }

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), new AllowedRolesGuard([user_role.ADMIN]))
  @Patch('users/:id/promote-manager')
  promoteManager(@Param('id') id: string) {
    return this.adminService.promoteManager(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), new AllowedRolesGuard([user_role.ADMIN]))
  @Patch('users/:id/demote')
  demoteManager(@Param('id') id: string) {
    return this.adminService.demoteManager(Number(id));
  }
}
