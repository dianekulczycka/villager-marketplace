import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AuthGuard } from '@nestjs/passport';
import * as userRequestInterface from '../user/interfaces/user-request.interface';
import { ApiErrorResponses } from '../shared/filters/dto/api-error-response.decorator';
import { AllowedRolesGuard } from '../auth/guards/allowed-roles.guard';

@ApiErrorResponses()
@UseGuards(AuthGuard('jwt'))
@Controller('users/profile/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(AllowedRolesGuard)
  @Get('')
  getProfileStats(@Request() request: userRequestInterface.UserRequest) {
    return this.statsService.getProfileStats(request);
  }
}
