import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';
import { MailModule } from '../mail/mail.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [PrismaModule, SecurityModule, MailModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
