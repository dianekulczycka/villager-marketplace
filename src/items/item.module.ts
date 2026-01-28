import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { User } from '../user/entities/user.entity';
import { ItemController } from './item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Item, User])],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
