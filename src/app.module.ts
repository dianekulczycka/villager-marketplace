import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ItemModule } from './items/item.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanUpJobModule } from './shared/jobs/clean-up.job/clean-up.job.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { StatsModule } from './stats/stats.module';
import { ModerationService } from './moderation/moderation.service';
import { MailModule } from './mail/mail.module';
import { ModerationInterceptor } from './moderation/moderation.interceptor.service';
import { RestrictedUserGuard } from './shared/guards/restricted-user.guard';
import { ModerationModule } from './moderation/moderation.module';
import { SecurityModule } from './security/security.module';
import { TokenService } from './security/token/token.service';

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
    StatsModule,
    ModerationModule,
    SecurityModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RestrictedUserGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ModerationInterceptor,
    },
    ModerationService,
    TokenService,
  ],
  controllers: [],
})
export class AppModule {}
