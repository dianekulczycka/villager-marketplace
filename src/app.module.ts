import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ItemModule } from './items/item.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 3306,
        username: configService.get<string>('DB_USERNAME') || 'user',
        password: configService.get<string>('DB_PASSWORD') || 'user',
        database:
          configService.get<string>('DB_DATABASE') || 'villager-marketplace-db',
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        // todo envservice
        // migrations: [join(__dirname, 'src', 'migrations', '*.{ts,js}')],
        // synchronize: false
        synchronize: true,
      }),
    }),
    AuthModule,
    UserModule,
    ItemModule,
  ],
})
export class AppModule {}
