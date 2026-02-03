import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ItemModule } from './items/item.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanUpJobModule } from './shared/jobs/clean-up.job/clean-up.job.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { MailModule } from './shared/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    ItemModule,
    AdminModule,
    CleanUpJobModule,
    MailModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  controllers: [],
})
export class AppModule {}
