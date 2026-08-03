import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { UserQueryDto } from '../user/dto/user-query.dto';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';
import * as userRequestInterface from '../user/interfaces/user-request.interface';
import { UserAdminDto } from '../user/dto/user-admin.dto';
import { AllowedRolesGuard } from '../auth/guards/allowed-roles.guard';
import { user_role } from '@prisma/client';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { Roles } from '../auth/guards/allowed-roles.decorator';
import { TokenService } from '../security/token/token.service';
import { ApiErrorResponses } from '../shared/filters/dto/api-error-response.decorator';
import { UserSelfDto } from '../user/dto/user-self.dto';

@ApiErrorResponses()
@UseGuards(AuthGuard('jwt'))
@Controller('admin/users/')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  // ----------------------------------------------------------------------------------------------------------
  // -------------------------------------------- MANAGER -----------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @Get('flagged')
  async getFlaggedUsers(
    @Query() query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    return this.adminService.findFlaggedUsers(query);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @Get('banned')
  async getBannedUsers(
    @Query() query: UserQueryDto,
  ): Promise<PaginationResponse<UserAdminDto>> {
    return this.adminService.findBannedUsers(query);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @Patch('id/:publicId')
  updateUserByAdmin(
    @Param('publicId') publicId: string,
    @Request() request: userRequestInterface.UserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    return this.userService.update(request, updateUserDto, publicId);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Delete('id/:publicId/soft-delete')
  async softDeleteUserByAdmin(
    @Param('publicId') publicId: string,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<void> {
    await this.userService.softDelete(request, publicId);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:publicId/ban')
  async banUser(
    @Param('publicId') publicId: string,
    @Request() request: userRequestInterface.UserRequest,
  ) {
    const userEmail = await this.adminService.banUser(publicId, request);
    await this.tokenService.blockTokensForUser(publicId);
    await this.mailService.notifyUserBanned(userEmail);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:publicId/unban')
  async unbanUser(@Param('publicId') publicId: string) {
    const userEmail = await this.adminService.unbanUser(publicId);
    await this.tokenService.blockTokensForUser(publicId);
    await this.mailService.sendRecoveryApproved(userEmail);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:publicId/unflag')
  async unflagUser(@Param('publicId') publicId: string) {
    const userEmail = await this.adminService.unflagUser(publicId);
    await this.tokenService.blockTokensForUser(publicId);
    await this.mailService.sendRecoveryApproved(userEmail);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:publicId/restore')
  async restoreUser(@Param('publicId') publicId: string): Promise<void> {
    const userEmail = await this.adminService.restoreUser(publicId);
    await this.mailService.sendRecoveryApproved(userEmail);
  }

  // ----------------------------------------------------------------------------------------------------------
  // --------------------------------------------- ADMIN ------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.ADMIN)
  @Get('managers')
  findAllManagers(@Query() query: UserQueryDto) {
    return this.adminService.findAllManagers(query);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.ADMIN)
  @HttpCode(204)
  @Delete('id/:publicId')
  async hardDeleteUser(@Param('publicId') publicId: string) {
    await this.adminService.hardDeleteUser(publicId);
    await this.tokenService.blockTokensForUser(publicId);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:publicId/promote-manager')
  async promoteManager(@Param('publicId') publicId: string): Promise<void> {
    await this.adminService.promoteManager(publicId);
    await this.tokenService.blockTokensForUser(publicId);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:publicId/demote')
  async demoteManager(@Param('publicId') publicId: string): Promise<void> {
    await this.adminService.demoteManager(publicId);
    await this.tokenService.blockTokensForUser(publicId);
  }
}
