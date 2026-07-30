import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemPublicDto } from './dto/item-public';
import * as userRequestInterface from '../user/interfaces/user-request.interface';
import { PaginationResponse } from '../shared/pagination/pagination-response.interface';
import { ItemQueryDto } from './dto/item-query.dto';
import { AllowedRolesGuard } from '../auth/guards/allowed-roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/guards/allowed-roles.decorator';
import { ModerationPipe } from '../moderation/moderation.pipe.service';
import { ModerationInterceptor } from '../moderation/moderation.interceptor.service';
import { ApiErrorResponses } from '../shared/filters/dto/api-error-response.decorator';
import { user_role } from '@prisma/client';

@ApiErrorResponses()
@UseGuards(AuthGuard('jwt'))
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get('')
  async getAll(
    @Query() query: ItemQueryDto,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<PaginationResponse<ItemPublicDto>> {
    return this.itemService.findAllPublic(query, request);
  }

  @Get('id/:publicId')
  async getById(
    @Param('publicId') publicId: string,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<ItemPublicDto> {
    return this.itemService.findById(publicId, request);
  }

  @Post('id/:publicId/views')
  async incrementViews(
    @Param('publicId') publicId: string,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<void> {
    await this.itemService.incrementViews(publicId, request);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.SELLER)
  @Get('my')
  async getMyItems(
    @Query() query: ItemQueryDto,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<PaginationResponse<ItemPublicDto>> {
    return this.itemService.findMyItems(query, request);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.SELLER)
  @UsePipes(new ModerationPipe(['description']))
  @UseInterceptors(ModerationInterceptor)
  @Post('')
  async create(
    @Request() request: userRequestInterface.UserRequest,
    @Body() createItemDto: CreateItemDto,
  ): Promise<ItemPublicDto> {
    return await this.itemService.create(request, createItemDto);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.SELLER, user_role.MANAGER, user_role.ADMIN)
  @UsePipes(new ModerationPipe(['description']))
  @UseInterceptors(ModerationInterceptor)
  @Patch('id/:publicId')
  async update(
    @Param('publicId') publicId: string,
    @Request() request: userRequestInterface.UserRequest,
    @Body() updateItemDto: UpdateItemDto,
  ): Promise<ItemPublicDto> {
    return this.itemService.update(request, publicId, updateItemDto);
  }

  @UseGuards(AllowedRolesGuard)
  @Roles(user_role.SELLER, user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Delete('id/:publicId/soft-delete')
  async softDelete(
    @Param('publicId') publicId: string,
    @Request() request: userRequestInterface.UserRequest,
  ): Promise<void> {
    return this.itemService.softDelete(request, publicId);
  }
}
