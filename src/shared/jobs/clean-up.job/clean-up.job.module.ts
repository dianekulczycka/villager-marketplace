import { Module } from '@nestjs/common';
import { CleanJobs } from './clean-up.job.service';

@Module({
  providers: [CleanJobs],
})
export class CleanUpJobModule {}
