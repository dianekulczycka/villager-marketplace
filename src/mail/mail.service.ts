import { Injectable } from '@nestjs/common';
import { AccountRecoveryRequestDto } from '../user/dto/account-recovery-request.dto';

@Injectable()
export class MailService {
  notifyManagersAboutFlaggedUser(userId: number) {
    console.log(`USER FLAGGED: ${userId}`);
  }

  notifyManagersAboutRecoveryRequest(
    accountRecoveryRequestDto: AccountRecoveryRequestDto,
  ) {
    console.log(
      `USER REQUEST: ${accountRecoveryRequestDto.email} ${accountRecoveryRequestDto.actionType}`,
    );
  }

  notifyUser(userId: number) {
    console.log(`USER forgiven: ${userId}`);
  }
}
