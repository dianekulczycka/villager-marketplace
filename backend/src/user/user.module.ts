import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ModerationModule } from '../moderation/moderation.module';
import { SecurityModule } from '../security/security.module';
import { MailModule } from '../mail/mail.module';
import { TokenService } from '../security/token/token.service';

@Module({
  imports: [PrismaModule, ModerationModule, SecurityModule, MailModule],
  controllers: [UserController],
  providers: [UserService, TokenService],
  exports: [UserService],
})
export class UserModule {}
