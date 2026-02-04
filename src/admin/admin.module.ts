import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [UserModule, AuthModule, MailModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
