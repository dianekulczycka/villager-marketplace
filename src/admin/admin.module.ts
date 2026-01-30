import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { ItemModule } from '../items/item.module';

@Module({
  imports: [UserModule, ItemModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
