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
import { IPaginatedResponse } from '../shared/pagination/pagination-response.interface';
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
@Controller('admin')
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
  @Get('users')
  async getAllUsers(
    @Query() query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return this.adminService.findAllUsers(query);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @Get('users/flagged')
  async getFlaggedUsers(
    @Query() query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return this.adminService.findFlaggedUsers(query);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @Get('users/banned')
  async getBannedUsers(
    @Query() query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return this.adminService.findBannedUsers(query);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @Patch('users/:id')
  updateUserByAdmin(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    return this.userService.update(request, Number(id), updateUserDto);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('users/:id/soft-delete')
  async softDeleteUserByAdmin(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
  ): Promise<void> {
    return this.userService.softDelete(request, Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('users/:id/ban')
  async banUser(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
  ) {
    await this.adminService.banUser(Number(id), request);
    await this.tokenService.blockTokensForUser(Number(id));
    await this.mailService.notifyUserBanned(Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('users/:id/unban')
  async unbanUser(@Param('id') id: string) {
    await this.adminService.unbanUser(Number(id));
    await this.tokenService.blockTokensForUser(Number(id));
    await this.mailService.sendRecoveryApproved(Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('users/:id/unflag')
  async unflagUser(@Param('id') id: string) {
    await this.adminService.unflagUser(Number(id));
    await this.tokenService.blockTokensForUser(Number(id));
    await this.mailService.sendRecoveryApproved(Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('users/:id/restore')
  async restoreUser(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    await this.adminService.restoreUser(Number(id));
    await this.mailService.sendRecoveryApproved(Number(id));
    const { accessToken, refreshToken } =
      await this.tokenService.issueTokenPairForUser(Number(id));

    this.tokenService.setAuthCookies(res, accessToken, refreshToken);
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
  @Delete('users/:id')
  async hardDeleteUser(@Param('id') id: string) {
    await this.adminService.hardDeleteUser(Number(id));
    await this.tokenService.blockTokensForUser(Number(id));
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.ADMIN)
  @HttpCode(204)
  @Patch('users/:id/promote-manager')
  async promoteManager(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    await this.adminService.promoteManager(Number(id));
    await this.tokenService.blockTokensForUser(Number(id));
    const { accessToken, refreshToken } =
      await this.tokenService.issueTokenPairForUser(Number(id));

    this.tokenService.setAuthCookies(res, accessToken, refreshToken);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.ADMIN)
  @HttpCode(204)
  @Patch('users/:id/demote')
  async demoteManager(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    await this.adminService.demoteManager(Number(id));
    await this.tokenService.blockTokensForUser(Number(id));
    const { accessToken, refreshToken } =
      await this.tokenService.issueTokenPairForUser(Number(id));

    this.tokenService.setAuthCookies(res, accessToken, refreshToken);
  }
}
