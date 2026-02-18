import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { SecurityModule } from '../security/security.module';
import { TokenService } from '../security/token/token.service';

@Module({
  imports: [UserModule, MailModule, SecurityModule],
  controllers: [AdminController],
  providers: [AdminService, TokenService],
})
export class AdminModule {}
