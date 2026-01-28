import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { Token } from './entities/token.entity';
import { ItemService } from '../items/item.service';
import { User } from '../user/entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Token, Item]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ItemService, UserService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
