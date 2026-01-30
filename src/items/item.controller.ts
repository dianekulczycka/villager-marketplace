import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemPublicDto } from './dto/item-public';
import * as userRequestInterface from '../user/interfaces/user-request.interface';
import { IPaginatedResponse } from '../shared/pagination/pagination-response.interface';
import { ItemQueryDto } from './dto/item-query.dto';
import { SellerGuard } from '../auth/guards/role.guards';

@Controller('items')
export class ItemController {
  constructor(private readonly itemsService: ItemService) {}

  @Get('')
  async getAll(
    @Query() query: ItemQueryDto,
  ): Promise<IPaginatedResponse<ItemPublicDto>> {
    return this.itemsService.findAllPublic(query);
  }

  @Get('/id/:id')
  async getById(@Param('id') id: string): Promise<ItemPublicDto> {
    return this.itemsService.findById(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), SellerGuard)
  @Post('')
  async create(
    @Request() request: userRequestInterface.IUserRequest,
    @Body() createItemDto: CreateItemDto,
  ): Promise<ItemPublicDto> {
    return await this.itemsService.create(request, createItemDto);
  }

  @UseGuards(AuthGuard('jwt'), SellerGuard)
  @Patch('id/:id')
  async update(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
    @Body() updateItemDto: UpdateItemDto,
  ): Promise<ItemPublicDto> {
    return this.itemsService.update(request, Number(id), updateItemDto);
  }

  @UseGuards(AuthGuard('jwt'), SellerGuard)
  @Patch('id/:id/soft-delete')
  async softDelete(
    @Param('id') id: string,
    @Request() request: userRequestInterface.IUserRequest,
  ): Promise<void> {
    return this.itemsService.softDelete(request, Number(id));
  }
}
