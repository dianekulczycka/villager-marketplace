import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { ItemService } from '../items/item.service';
import { UserPublicDto } from './dto/user-public.dto';
import { plainToInstance } from 'class-transformer';
import { IUserRequest } from './interfaces/user-request.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => ItemService))
    private readonly itemService: ItemService,
  ) {}

  async findAll(): Promise<UserPublicDto[]> {
    const users = await this.userRepository.find();
    return plainToInstance(UserPublicDto, users);
  }

  async findById(id: number): Promise<UserPublicDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User was not found`);
    }
    return plainToInstance(UserPublicDto, user);
  }

  async findSelf(request: IUserRequest): Promise<User | null> {
    const { userId } = request.user;
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async updateSelf(
    request: IUserRequest,
    updateUserDto: UpdateUserDto,
  ): Promise<UserPublicDto> {
    const { userId } = request.user;
    await this.userRepository.update(userId, updateUserDto);
    return this.findById(userId);
  }

  async softDeleteUser(id: number): Promise<void> {
    await this.userRepository.update(id, { isDeleted: true });
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  // banUser unbanUser changeUserRole makeUserASeller - todo
}
