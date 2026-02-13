import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { ModerationPipe } from './moderation.pipe.service';
import { SecurityModule } from '../security/security.module';
import { TokenService } from '../security/token/token.service';

@Module({
  imports: [MailModule, PrismaModule, SecurityModule],
  providers: [ModerationService, ModerationPipe, TokenService],
  exports: [ModerationService],
})
export class ModerationModule {}
