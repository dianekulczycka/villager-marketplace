import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ModerationModule } from '../moderation/moderation.module';
import { SecurityModule } from '../security/security.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, ModerationModule, SecurityModule, MailModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
