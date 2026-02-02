import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserPublicDto } from './dto/user-public.dto';
import * as userRequestInterface from './interfaces/user-request.interface';
import { UserSelfDto } from './dto/user-self.dto';
import { IPaginatedResponse } from '../shared/pagination/pagination-response.interface';
import { UserQueryDto } from './dto/user-query.dto';
import { BecomeSellerRequestDto } from './dto/become-seller-request';
import { ITokenPair } from '../auth/interfaces/token-pair.interface';
import { AllowedRolesGuard } from '../auth/guards/role.guards';
import { user_role } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAll(
    @Query() query: UserQueryDto,
  ): Promise<IPaginatedResponse<UserPublicDto>> {
    return this.userService.findAllPublic(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('id/:id')
  async getById(@Param('id') id: string): Promise<UserPublicDto> {
    return this.userService.findById(Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(
    @Request() request: userRequestInterface.IUserRequest,
  ): Promise<UserSelfDto> {
    return this.userService.findSelf(request);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async update(
    @Request() request: userRequestInterface.IUserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    return this.userService.update(request, request.user.userId, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile/soft-delete')
  async softDelete(
    @Request() request: userRequestInterface.IUserRequest,
  ): Promise<void> {
    return this.userService.softDelete(request);
  }

  @UseGuards(
    AuthGuard('jwt'),
    new AllowedRolesGuard([
      user_role.BUYER,
      user_role.SELLER,
      user_role.MANAGER,
      user_role.ADMIN,
    ]),
  )
  @Patch('profile/become-seller')
  async becomeSeller(
    @Request() request: userRequestInterface.IUserRequest,
    @Body() becomeSellerRequestDto: BecomeSellerRequestDto,
  ): Promise<ITokenPair> {
    return await this.userService.makeUserSeller(
      request,
      becomeSellerRequestDto,
    );
  }
}
