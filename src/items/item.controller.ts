import {
  Body,
  Controller,
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
import { IPaginatedResponse } from '../shared/pagination/pagination-response.interface';
import { ItemQueryDto } from './dto/item-query.dto';
import { AllowedRolesGuard } from '../auth/guards/allowed-roles.guard';
import { user_role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/guards/allowed-roles.decorator';
import { ModerationPipe } from '../moderation/moderation.pipe.service';
import { ModerationInterceptor } from '../moderation/moderation.interceptor.service';
import { ApiErrorResponses } from '../shared/filters/dto/api-error-response.decorator';

@ApiErrorResponses()
@Controller('items')
export class ItemController {
  constructor(private readonly itemsService: ItemService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('')
  async getAll(
    @Query() query: ItemQueryDto,
    @Request() request: userRequestInterface.IUserRequest,
  ): Promise<IPaginatedResponse<ItemPublicDto>> {
    return this.itemsService.findAllPublic(query, request);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('id/:id')
  async getById(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
  ): Promise<ItemPublicDto> {
    return this.itemsService.findById(Number(id), request);
  }

  @UseGuards(AuthGuard('jwt'), AllowedRolesGuard)
  @Roles(user_role.SELLER)
  @Get('my')
  async getMyItems(
    @Request() request: userRequestInterface.IUserRequest,
  ): Promise<ItemPublicDto[]> {
    return this.itemsService.findMyItems(request);
  }

  @UseGuards(AuthGuard('jwt'), AllowedRolesGuard)
  @Roles(user_role.SELLER)
  @UsePipes(new ModerationPipe(['description']))
  @UseInterceptors(ModerationInterceptor)
  @Post('')
  async create(
    @Request() request: userRequestInterface.IUserRequest,
    @Body() createItemDto: CreateItemDto,
  ): Promise<ItemPublicDto> {
    return await this.itemsService.create(request, createItemDto);
  }

  @UseGuards(AuthGuard('jwt'), AllowedRolesGuard)
  @Roles(user_role.SELLER, user_role.MANAGER, user_role.ADMIN)
  @UsePipes(new ModerationPipe(['description']))
  @UseInterceptors(ModerationInterceptor)
  @Patch('id/:id')
  async update(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
    @Body() updateItemDto: UpdateItemDto,
  ): Promise<ItemPublicDto> {
    return this.itemsService.update(request, Number(id), updateItemDto);
  }

  @UseGuards(AuthGuard('jwt'), AllowedRolesGuard)
  @Roles(user_role.SELLER, user_role.MANAGER, user_role.ADMIN)
  @HttpCode(204)
  @Patch('id/:id/soft-delete')
  async softDelete(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
  ): Promise<void> {
    return this.itemsService.softDelete(request, Number(id));
  }
}
