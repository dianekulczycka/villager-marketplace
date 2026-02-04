import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [AuthModule, MailModule, PrismaModule],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
