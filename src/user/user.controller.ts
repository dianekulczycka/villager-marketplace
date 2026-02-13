import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  Request,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
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
import { AllowedRolesGuard } from '../auth/guards/allowed-roles.guard';
import { user_role } from '@prisma/client';
import express from 'express';
import { Roles } from '../auth/guards/allowed-roles.decorator';
import { ModerationPipe } from '../moderation/moderation.pipe.service';
import { ModerationInterceptor } from '../moderation/moderation.interceptor.service';
import { TokenService } from '../security/token/token.service';
import { ApiErrorResponses } from '../shared/filters/dto/api-error-response.decorator';

@ApiErrorResponses()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

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
  @UsePipes(new ModerationPipe(['username']))
  @UseInterceptors(ModerationInterceptor)
  @Patch('profile')
  async update(
    @Request() request: userRequestInterface.IUserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    return this.userService.update(request, request.user.userId, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  @Patch('profile/soft-delete')
  async softDelete(
    @Request() request: userRequestInterface.IUserRequest,
  ): Promise<void> {
    await this.userService.softDelete(request);
    await this.tokenService.blockTokensForUser(request.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), AllowedRolesGuard)
  @Roles(user_role.BUYER, user_role.SELLER, user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('profile/become-seller')
  async becomeSeller(
    @Request() request: userRequestInterface.IUserRequest,
    @Body() becomeSellerRequestDto: BecomeSellerRequestDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    const userId = await this.userService.makeUserSeller(
      request,
      becomeSellerRequestDto,
    );
    await this.tokenService.blockTokensForUser(userId);
    const { accessToken, refreshToken } =
      await this.tokenService.issueTokenPairForUser(userId);
    this.tokenService.setAuthCookies(res, accessToken, refreshToken);
  }
}
