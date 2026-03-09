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
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserPublicDto } from './dto/user-public.dto';
import { UserSelfDto } from './dto/user-self.dto';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';
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
import * as userRequestInterface from './interfaces/user-request.interface';

@ApiErrorResponses()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @Get()
  async getAll(
    @Query() query: UserQueryDto,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<PaginationResponse<UserPublicDto>> {
    return this.userService.findAllPublic(query, request);
  }

  @Get('id/:id')
  async getById(@Param('id') id: string): Promise<UserPublicDto> {
    return this.userService.findById(Number(id));
  }

  @Get('profile')
  getProfile(
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<UserSelfDto> {
    return this.userService.findSelf(request);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.BUYER, user_role.SELLER)
  @UsePipes(new ModerationPipe(['username']))
  @UseInterceptors(ModerationInterceptor)
  @Patch('profile')
  async update(
    @Request() request: userRequestInterface.UserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserSelfDto> {
    return this.userService.update(request, request.user.userId, updateUserDto);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.BUYER)
  @HttpCode(204)
  @Patch('profile/become-seller')
  async becomeSeller(
    @Request() request: userRequestInterface.UserRequest,
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

  @HttpCode(204)
  @Delete('profile/soft-delete')
  async softDelete(
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<void> {
    await this.userService.softDelete(request);
    await this.tokenService.blockTokensForUser(request.user.userId);
  }
}
