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
import { AllowedRolesGuard } from '../auth/guards/role.guard';
import { user_role } from '@prisma/client';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  // ----------------------------------------------------------------------------------------------------------
  // -------------------------------------------- MANAGER -----------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------

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

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Patch('users/:id/ban')
  async banUser(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
  ) {
    await this.adminService.banUser(Number(id), request);
    await this.authService.blockTokensForUser(Number(id));
    await this.mailService.notifyUserBanned(Number(id));
  }

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Patch('users/:id/unban')
  async unbanUser(@Param('id') id: string) {
    await this.adminService.unbanUser(Number(id));
    await this.authService.blockTokensForUser(Number(id));
    await this.mailService.sendRecoveryApproved(Number(id));
  }

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Patch('users/:id/unflag')
  async unflagUser(@Param('id') id: string) {
    await this.adminService.unflagUser(Number(id));
    await this.authService.blockTokensForUser(Number(id));
    await this.mailService.sendRecoveryApproved(Number(id));
  }

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([user_role.MANAGER, user_role.ADMIN]),
  )
  @Patch('users/:id/restore')
  async restoreUser(@Param('id') id: string): Promise<void> {
    await this.adminService.restoreUser(Number(id));
    await this.mailService.sendRecoveryApproved(Number(id));
    return await this.authService.issueTokenPairForUser(Number(id));
  }

  // ----------------------------------------------------------------------------------------------------------
  // --------------------------------------------- ADMIN ------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------

  @UseGuards(AuthGuard('jwt'), new AllowedRolesGuard([user_role.ADMIN]))
  @Get('managers')
  findAllManagers(@Query() query: UserQueryDto) {
    return this.adminService.findAllManagers(query);
  }

  @UseGuards(AuthGuard('jwt'), new AllowedRolesGuard([user_role.ADMIN]))
  @Delete('users/:id')
  async hardDeleteUser(@Param('id') id: string) {
    await this.adminService.hardDeleteUser(Number(id));
    await this.authService.blockTokensForUser(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), new AllowedRolesGuard([user_role.ADMIN]))
  @Patch('users/:id/promote-manager')
  async promoteManager(@Param('id') id: string): Promise<void> {
    await this.adminService.promoteManager(Number(id));
    await this.authService.blockTokensForUser(Number(id));
    return this.authService.issueTokenPairForUser(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), new AllowedRolesGuard([user_role.ADMIN]))
  @Patch('users/:id/demote')
  async demoteManager(@Param('id') id: string): Promise<void> {
    await this.adminService.demoteManager(Number(id));
    await this.authService.blockTokensForUser(Number(id));
    return this.authService.issueTokenPairForUser(Number(id));
  }
}
