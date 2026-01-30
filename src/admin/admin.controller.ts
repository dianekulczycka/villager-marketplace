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
import { BecomeSellerRequestDto } from '../user/dto/become-seller-request';
import { UserAdminDto } from '../user/dto/user-admin.dto';
import { AdminGuard, ManagerOrAdminGuard } from '../auth/guards/role.guards';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard('jwt'), ManagerOrAdminGuard)
  @Get('users')
  async getAllUsers(
    @Query() query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return this.adminService.findAllUsers(query);
  }

  @UseGuards(AuthGuard('jwt'), ManagerOrAdminGuard)
  @Get('users/flagged')
  async getFlaggedUsers(
    @Query() query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserAdminDto>> {
    return this.adminService.findFlaggedUsers(query);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('managers')
  findAllManagers() {
    return this.adminService.findAllManagers();
  }

  @UseGuards(AuthGuard('jwt'), ManagerOrAdminGuard)
  @Patch('users/:id/ban')
  async banUser(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
  ) {
    return await this.adminService.banUser(Number(id), request);
  }

  @UseGuards(AuthGuard('jwt'), ManagerOrAdminGuard)
  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), ManagerOrAdminGuard)
  @Patch('users/:userId/soft-delete')
  softDeleteUser(
    @Param('userId') userId: string,
    @Request() request: userRequestInterface.IUserRequest,
  ) {
    return this.adminService.softDeleteUser(Number(userId), request);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete('users/:id')
  hardDeleteUser(@Param('id') id: string) {
    return this.adminService.hardDeleteUser(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch('users/:id/promote-manager')
  promoteManager(@Param('id') id: string) {
    return this.adminService.promoteManager(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch('users/:id/demote')
  demoteManager(@Param('id') id: string) {
    return this.adminService.demoteManager(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), ManagerOrAdminGuard)
  @Patch('users/:id/make-seller')
  makeSeller(
    @Param('id') id: string,
    @Body() becomeSellerRequestDto: BecomeSellerRequestDto,
  ) {
    return this.adminService.makeUserSeller(Number(id), becomeSellerRequestDto);
  }
}
