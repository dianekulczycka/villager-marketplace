import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemPublicDto } from './dto/item-public';
import { plainToInstance } from 'class-transformer';
import { User } from '../user/entities/user.entity';
import { IUserRequest } from '../user/interfaces/user-request.interface';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<ItemPublicDto[]> {
    const items = await this.itemRepository.find({ relations: ['seller'] });
    return plainToInstance(ItemPublicDto, items, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: number): Promise<ItemPublicDto> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} was not found`);
    }
    return plainToInstance(ItemPublicDto, item, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    request: IUserRequest,
    createItemDto: CreateItemDto,
  ): Promise<ItemPublicDto> {
    const userPayload = request.user;
    const user = await this.userRepository.findOne({
      where: { id: userPayload.userId },
    });
    if (!user) {
      throw new NotFoundException(`User was not found`);
    }

    const savedItem = await this.itemRepository.save({
      ...createItemDto,
      seller: user,
    });
    return plainToInstance(ItemPublicDto, savedItem, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    request: IUserRequest,
    id: number,
    updateItemDto: UpdateItemDto,
  ): Promise<ItemPublicDto> {
    await this.assertUserOwnsItem(request, id);
    await this.itemRepository.update(id, updateItemDto);
    return plainToInstance(ItemPublicDto, this.findById(id));
  }

  // todo soft delete item user token

  // todo cron delete tokens every 30 mins from db

  async softDelete(request: IUserRequest, id: number): Promise<void> {
    await this.assertUserOwnsItem(request, id);
    await this.itemRepository.update({ id }, { isDeleted: true });
  }

  async softDeleteItemsOfUser(userId: number): Promise<void> {
    await this.itemRepository.update(
      { seller: { id: userId } },
      { isDeleted: true },
    );
  }

  async delete(request: IUserRequest, id: number): Promise<void> {
    await this.assertUserOwnsItem(request, id);
    await this.itemRepository.delete(id);
  }

  async assertUserOwnsItem(
    request: IUserRequest,
    itemId: number,
  ): Promise<void> {
    const userId = request.user.userId;
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['seller'],
    });

    if (!item) {
      throw new NotFoundException('Item was not found');
    }

    if (!item.seller || item.seller.id !== userId) {
      throw new UnauthorizedException('Not authorized to modify item');
    }
  }
}
