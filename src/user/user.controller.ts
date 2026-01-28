import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserPublicDto } from './dto/user-public.dto';
import * as userRequestInterface from './interfaces/user-request.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getAll(): Promise<UserPublicDto[]> {
    return this.userService.findAll();
  }

  @Get('id/:id')
  async getById(@Param('id') id: string): Promise<UserPublicDto> {
    return this.userService.findById(Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() request: userRequestInterface.IUserRequest) {
    return this.userService.findSelf(request);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async update(
    @Request() request: userRequestInterface.IUserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserPublicDto> {
    return this.userService.updateSelf(request, updateUserDto);
  }
}
