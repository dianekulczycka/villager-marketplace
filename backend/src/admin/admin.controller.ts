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
  Res,
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
import express from 'express';
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
  @Patch('id/:id')
  updateUserByAdmin(
    @Param('id') id: string,
    @Request() request: userRequestInterface.UserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    return this.userService.update(request, Number(id), updateUserDto);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Delete('id/:id/soft-delete')
  async softDeleteUserByAdmin(
    @Param('id') id: string,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<void> {
    return this.userService.softDelete(request, Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:id/ban')
  async banUser(
    @Param('id') id: string,
    @Request() request: userRequestInterface.UserRequest,
  ) {
    await this.adminService.banUser(Number(id), request);
    await this.tokenService.blockTokensForUser(Number(id));
    await this.mailService.notifyUserBanned(Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:id/unban')
  async unbanUser(@Param('id') id: string) {
    await this.adminService.unbanUser(Number(id));
    await this.tokenService.blockTokensForUser(Number(id));
    await this.mailService.sendRecoveryApproved(Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:id/unflag')
  async unflagUser(@Param('id') id: string) {
    await this.adminService.unflagUser(Number(id));
    await this.tokenService.blockTokensForUser(Number(id));
    await this.mailService.sendRecoveryApproved(Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:id/restore')
  async restoreUser(@Param('id') id: string): Promise<void> {
    await this.adminService.restoreUser(Number(id));
    await this.mailService.sendRecoveryApproved(Number(id));
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
  @Delete('id/:id')
  async hardDeleteUser(@Param('id') id: string) {
    await this.adminService.hardDeleteUser(Number(id));
    await this.tokenService.blockTokensForUser(Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:id/promote-manager')
  async promoteManager(@Param('id') id: string): Promise<void> {
    await this.adminService.promoteManager(Number(id));
    await this.tokenService.blockTokensForUser(Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:id/demote')
  async demoteManager(@Param('id') id: string): Promise<void> {
    await this.adminService.demoteManager(Number(id));
    await this.tokenService.blockTokensForUser(Number(id));
  }
}
