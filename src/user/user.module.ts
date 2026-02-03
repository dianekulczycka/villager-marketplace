import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ItemModule } from '../items/item.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../shared/mail/mail.module';

@Module({
  imports: [AuthModule, PrismaModule, MailModule, forwardRef(() => ItemModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
